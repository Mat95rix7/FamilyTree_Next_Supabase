import { supabaseAdmin as supabaseServer } from '@/lib/supabaseAdmin';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let query = supabaseServer
      .from('profiles')
      .select('id, username, email, role, isActive', { count: 'exact' })
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike('username', `%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return Response.json({
      users: data,
      pagination: {
        total: count,
        pages: Math.ceil((count || 0) / limit),
        currentPage: page,
        limit
      }
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function POST(req) {
  const body = await req.json();
  const { email, password, username, role = 'user', isActive = true } = body;

  const { data: user, error: createError } = await supabaseServer.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (createError) {
    return new Response(JSON.stringify({ error: createError.message }), { status: 500 });
  }

  const { error: profileError } = await supabaseServer
    .from('profiles')
    .insert([{ id: user.user.id, username, role, isActive, email }]);

  if (profileError) {
    return new Response(JSON.stringify({ error: profileError.message }), { status: 500 });
  }

  return Response.json({
    id: user.user.id,
    email,
    username,
    role,
    isActive
  }, { status: 201 });
}
