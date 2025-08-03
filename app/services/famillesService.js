import { supabase } from '@/lib/supabaseClient.js';
import { getAge } from '@/lib/getAge';

export async function getHommesMaries() {
  const { data, error } = await supabase
    .from('personne')
    .select('id, first_name, last_name, birth_date, photo, conjointId, date_deces')
    .eq('gender', 'Homme')
    .not('conjointId', 'is', null);

  if (error) {
    throw new Error('Erreur Supabase: ' + error.message);
  }

  return (data || []).map(homme => ({
    ...homme,
    age: getAge(homme.birth_date, homme.date_deces)
  }));
}


export async function getFamilleByHommeMarie(pereId) {
  // 1. Récupérer le père
  const { data: mari, error: errorMari } = await supabase
    .from('personne')
    .select('*')
    .eq('id', pereId)
    .single();

  if (errorMari || !mari) {
    throw new Error('Homme marié non trouvé');
  }

  if (!mari.conjointId) {
    throw new Error("Cette personnene n'est pas mariée");
  }

  // 2. Récupérer la conjointe
  const { data: epouse } = await supabase
    .from('personne')
    .select('*')
    .eq('id', mari.conjointId)
    .single();

  // 3. Récupérer les enfants (père OU mère)
  const { data: enfants } = await supabase
    .from('personne')
    .select('*')
    .or(`fatherId.eq.${mari.id},motherId.eq.${epouse ? epouse.id : 0}`); // si epouse null => pas d'enfants par elle

  // 4. Grands-parents paternels
  const [grand_pere_paternel, grand_mere_paternelle] = await Promise.all([
    mari.fatherId
      ? supabase.from('personne').select('*').eq('id', mari.fatherId).single()
      : { data: null },
    mari.motherId
      ? supabase.from('personne').select('*').eq('id', mari.motherId).single()
      : { data: null }
  ]);

  // 5. Grands-parents maternels
  const [grand_pere_maternel, grand_mere_maternelle] = epouse
    ? await Promise.all([
        epouse.fatherId
          ? supabase.from('personne').select('*').eq('id', epouse.fatherId).single()
          : { data: null },
        epouse.motherId
          ? supabase.from('personne').select('*').eq('id', epouse.motherId).single()
          : { data: null }
      ])
    : [{ data: null }, { data: null }];

  return {
    pere: mari ? { ...mari, age: getAge(mari.birth_date, mari.date_deces) } : null,
    mere: epouse ? { ...epouse, age: getAge(epouse.birth_date, epouse.date_deces) } : null,
    enfants: (enfants || []).map(e => ({
      ...e,
      age: getAge(e.birth_date, e.date_deces)
    })),
    grand_pere_paternel: grand_pere_paternel.data
      ? { ...grand_pere_paternel.data, age: getAge(grand_pere_paternel.data.birth_date, grand_pere_paternel.data.date_deces) }
      : null,
    grand_mere_paternelle: grand_mere_paternelle.data
      ? { ...grand_mere_paternelle.data, age: getAge(grand_mere_paternelle.data.birth_date, grand_mere_paternelle.data.date_deces) }
      : null,
    grand_pere_maternel: grand_pere_maternel.data
      ? { ...grand_pere_maternel.data, age: getAge(grand_pere_maternel.data.birth_date, grand_pere_maternel.data.date_deces) }
      : null,
    grand_mere_maternelle: grand_mere_maternelle.data
      ? { ...grand_mere_maternelle.data, age: getAge(grand_mere_maternelle.data.birth_date, grand_mere_maternelle.data.date_deces) }
      : null,
    is_mari: true,
    nb_enfants: (enfants || []).length
  };
}
