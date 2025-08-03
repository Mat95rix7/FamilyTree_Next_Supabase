// app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin as supabaseServer } from '@/lib/supabaseClient'; // client configuré avec service_role

export async function GET() {
  try {
    const { data: stats, error: statsError } = await supabaseServer
      .from('admin_stats')
      .select('*')
      .single();
    if (statsError) throw statsError;

    const { data: genderStats, error: genderError } = await supabaseServer
      .from('gender_distribution')
      .select('*');
    if (genderError) throw genderError;

    const { data: birthDecades, error: decadesError } = await supabaseServer
      .from('birth_decades')
      .select('*');
    if (decadesError) throw decadesError;

    return NextResponse.json({
      users: [
        { role: 'admin', count: stats.total_admins },
        { role: 'user', count: stats.total_normal_users }
      ],
      persons: {
        totalPersons: stats.total_personnes,
        deceased: stats.total_decedes,
        averageAge: stats.age_moyen
      },
      genderDistribution: genderStats,
      birthDecades
    });
  } catch (err) {
    console.error('Erreur /api/admin/stats:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
