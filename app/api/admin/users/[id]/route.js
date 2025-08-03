import { supabaseAdmin as supabaseServer } from '@/lib/supabaseAdmin';

export async function PUT(req, { params }) {
  const { id } = params;
  const { username, email, role, isActive } = await req.json();

  const { error: profileError } = await supabaseServer
    .from('profiles')
    .update({ username, role, isActive, email })
    .eq('id', id);

  if (profileError) {
    return new Response(JSON.stringify({ error: profileError.message }), { status: 500 });
  }

  const { error: emailError } = await supabaseServer.auth.admin.updateUserById(id, {
    email
  });

  if (emailError) {
    return new Response(JSON.stringify({ error: emailError.message }), { status: 500 });
  }

  return Response.json({ message: 'Utilisateur mis à jour avec succès' });
}

export async function DELETE(req, { params }) {
  const { id } = params;

  const { error } = await supabaseServer.auth.admin.deleteUser(id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return Response.json({ message: 'Utilisateur supprimé avec succès' });
}
