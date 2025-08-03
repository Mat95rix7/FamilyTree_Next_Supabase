import { supabase } from '@/lib/supabaseClient';
import imagekit from '@/lib/imagekit'; // ton client ImageKit configuré

// 💡 Petite fonction utilitaire pour calculer l’âge
function getAge(birthDate, dateDeces = null) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const end = dateDeces ? new Date(dateDeces) : new Date();
  let age = end.getFullYear() - birth.getFullYear();
  const m = end.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// 🎯 Fonction principale : récupérer toutes les personnes + calcul âge
export async function getAllPersonnes() {
  const { data, error } = await supabase
    .from('personne') // nom de ta table Supabase
    .select(`
      *,
      father:fatherId (id, first_name, last_name),
      mother:motherId (id, first_name, last_name),
      conjoint:conjointId (id, first_name, last_name)
    `)
    .order('last_name', { ascending: true });

  if (error) throw error;

  const personnesAvecAge = data.map((personne) => ({
    ...personne,
    age: getAge(personne.birth_date, personne.date_deces),
  }));

  return personnesAvecAge;
}

// Lire une personne par ID
export async function getOnePersonne(id) {
  try {
    // Validation de l'ID
    if (!id) {
      throw new Error('ID de la personne requis');
    }

    const { data, error } = await supabase
      .from('personne')
      .select(`
        *,
        father:fatherId (id, first_name, last_name, photo),
        mother:motherId (id, first_name, last_name, photo),
        conjoint:conjointId (id, first_name, last_name, photo),
        children:personne!fatherId (id, first_name, last_name, birth_date),
        children_as_mother:personne!motherId (id, first_name, last_name, birth_date)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Personne non trouvée');
      }
      throw error;
    }

    // Combiner les enfants des deux relations
    const allChildren = [
      ...(data.children || []),
      ...(data.children_as_mother || [])
    ].reduce((unique, child) => {
      // Éviter les doublons si une personne est à la fois père et mère d'un enfant
      if (!unique.find(c => c.id === child.id)) {
        unique.push(child);
      }
      return unique;
    }, []).sort((a, b) => new Date(a.birth_date) - new Date(b.birth_date));

    return {
      ...data,
      age: getAge(data.birth_date, data.date_deces),
      children: allChildren,
      // Nettoyer les propriétés temporaires
      children_as_mother: undefined
    };
  } catch (error) {
    console.error('Erreur dans getOnePersonne:', error);
    throw error;
  }
}// Créer une personne

export async function createPersonne(formData, fileBuffer = null) {
  try {
    let photoUrl = null;

    // Upload de l'image si fournie
    if (fileBuffer) {
      const result = await imagekit.upload({
        file: fileBuffer,
        fileName: `${Date.now()}-${formData.fileName || 'photo.jpg'}`,
        folder: '/users',
      });
      photoUrl = result.url;
    }

    // Création de la personne
    const insertData = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      gender: formData.get('gender'),
      birth_date: formData.get('birth_date'),
      birth_place: formData.get('birth_place'),
      fatherId: formData.get('fatherId') || null,
      motherId: formData.get('motherId') || null,
      conjointId: formData.get('conjointId') || null,
      date_deces: formData.get('date_deces') || formData.get('dateDeces') || null,
      notes: formData.get('notes') || null,
      photo: photoUrl,
    };

    const { data: created, error } = await supabase
      .from('personne')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    // Mise à jour du conjoint (réciprocité)
    if (formData.conjointId) {
      await supabase
        .from('personne')
        .update({ conjointId: created.id })
        .eq('id', formData.conjointId);
    }

    return created;
  } catch (error) {
    throw error;
  }
}

// Mettre à jour une personne
// Version améliorée avec gestion FormData et transactions
export async function updatePersonne(id, formData) {
  try {
    // Récupérer la personne existante
    const { data: existing, error: fetchError } = await supabase
      .from('personne')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      throw new Error('Personne non trouvée');
    }

    let photoUrl = existing.photo;

    // Gérer le fichier photo depuis FormData
    const file = formData.get('photo');
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      const result = await imagekit.upload({
        file: fileBuffer,
        fileName: `${Date.now()}-${file.name}`,
        folder: '/users',
      });
      photoUrl = result.url;
    }

    // Extraire les données depuis FormData
    const updatedData = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      gender: formData.get('gender'),
      birth_date: formData.get('birth_date'),
      birth_place: formData.get('birth_place'),
      fatherId: formData.get('fatherId') || null,
      motherId: formData.get('motherId') || null,
      conjointId: formData.get('conjointId') || null,
      date_deces: formData.get('date_deces') || formData.get('dateDeces') || null,
      notes: formData.get('notes') || null,
      photo: photoUrl,
    };

    // Si l'ancien conjoint existe mais est différent du nouveau
    if (existing.conjointId && existing.conjointId !== updatedData.conjointId) {
      await supabase
        .from('personne')
        .update({ conjointId: null })
        .eq('id', existing.conjointId);
    }

    // Si un nouveau conjoint est défini et qu'il est différent
    if (updatedData.conjointId && updatedData.conjointId !== existing.conjointId) {
      await supabase
        .from('personne')
        .update({ conjointId: id })
        .eq('id', updatedData.conjointId);
    }

    // Mise à jour finale
    const { data: updated, error: updateError } = await supabase
      .from('personne')
      .update(updatedData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return updated;
  } catch (error) {
    throw error;
  }
}
// Version améliorée avec gestion des relations et nettoyage
export async function deletePersonne(id) {
  try {
    // Validation de l'ID
    if (!id) {
      throw new Error('ID de la personne requis');
    }

    // 1. Récupérer les informations de base de la personne
    const { data: personne, error: fetchError } = await supabase
      .from('personne')
      .select('id, conjointId, photo')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new Error('Personne non trouvée');
      }
      throw fetchError;
    }

    // 2. Vérifier séparément s'il y a des enfants (comme père)
    const { data: childrenAsFather, error: childrenFatherError } = await supabase
      .from('personne')
      .select('id')
      .eq('fatherId', id)
      .limit(1);

    if (childrenFatherError) throw childrenFatherError;

    // 3. Vérifier séparément s'il y a des enfants (comme mère)
    const { data: childrenAsMother, error: childrenMotherError } = await supabase
      .from('personne')
      .select('id')
      .eq('motherId', id)
      .limit(1);

    if (childrenMotherError) throw childrenMotherError;

    // 4. Vérifier s'il y a des enfants
    const hasChildren = (childrenAsFather && childrenAsFather.length > 0) || 
                       (childrenAsMother && childrenAsMother.length > 0);

    if (hasChildren) {
      throw new Error('Impossible de supprimer une personne qui a des enfants. Veuillez d\'abord gérer les relations familiales.');
    }

    // 5. Supprimer la réciprocité du conjoint
    if (personne.conjointId) {
      await supabase
        .from('personne')
        .update({ conjointId: null })
        .eq('id', personne.conjointId);
    }

    // 6. Supprimer les références à cette personne comme parent
    await supabase
      .from('personne')
      .update({ fatherId: null })
      .eq('fatherId', id);

    await supabase
      .from('personne')
      .update({ motherId: null })
      .eq('motherId', id);

    // 7. Supprimer l'image associée (optionnel)
    if (personne.photo) {
      try {
        const imageId = personne.photo.split('/').pop().split('.')[0];
        await imagekit.deleteFile(imageId);
      } catch (imageError) {
        console.warn('Erreur lors de la suppression de l\'image:', imageError);
        // Continue même si la suppression d'image échoue
      }
    }

    // 8. Supprimer la personne
    const { error: deleteError } = await supabase
      .from('personne')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    return { message: 'Personne supprimée avec succès', id };
  } catch (error) {
    console.error('Erreur dans deletePersonne:', error);
    throw error;
  }
}
// Version alternative pour suppression "soft" (marquer comme supprimé)
export async function softDeletePersonne(id) {
  try {
    if (!id) {
      throw new Error('ID de la personne requis');
    }

    const { data: updated, error } = await supabase
      .from('personne')
      .update({ 
        deleted_at: new Date().toISOString(),
        // Optionnel: anonymiser les données
        first_name: 'Supprimé',
        last_name: 'Supprimé',
        notes: null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Personne non trouvée');
      }
      throw error;
    }

    return updated;
  } catch (error) {
    console.error('Erreur dans softDeletePersonne:', error);
    throw error;
  }
}