import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(request) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  try {
    const { action, email, password, username } = await request.json();

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    if (action === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });

      // Récupérer le profil pour avoir le rôle
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

      const response = NextResponse.json({ success: true });
        cookieStore.getAll().forEach(cookie => {
        response.cookies.set(cookie.name, cookie.value, {
          path: cookie.path ?? '/',
          httpOnly: cookie.httpOnly ?? true,
          secure: cookie.secure ?? (process.env.NODE_ENV === 'production'),
          sameSite: cookie.sameSite ?? 'lax',
          maxAge: cookie.maxAge,
        });
      });

      response.cookies.set('sb-user-role', profile.role, {
        httpOnly: true,
        path: '/',
        // secure: process.env.NODE_ENV === 'production',
        secure: false,
        maxAge: data.session.expires_in,
        sameSite: 'lax',
      });

      return response;
    }

    if (action === "register") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });

      const response = NextResponse.json({ success: true });

      if (data.session) {
        // Même logique que login si session créée directement
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

        const response = NextResponse.json({ success: true });
          cookieStore.getAll().forEach(cookie => {
          response.cookies.set(cookie.name, cookie.value, {
            path: cookie.path ?? '/',
            httpOnly: cookie.httpOnly ?? true,
            secure: cookie.secure ?? (process.env.NODE_ENV === 'production'),
            sameSite: cookie.sameSite ?? 'lax',
            maxAge: cookie.maxAge,
          });
        });

        response.cookies.set('sb-user-role', profile.role, {
          httpOnly: true,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          maxAge: data.session.expires_in,
          sameSite: 'lax',
        });
      }

      return response;
    }

    if (action === "logout") {
      const { error } = await supabase.auth.signOut();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });

      const response = NextResponse.json({ success: true });
      cookieStore.getAll().forEach((cookie) => {
        if (cookie.name.startsWith("sb-") && (cookie.name.includes("auth-token") || cookie.name.includes("refresh-token"))) {
          response.cookies.delete(cookie.name, { path: "/" });
        }
      });
      response.cookies.delete('sb-user-role', { path: '/' });
      return response;
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 });
  }
}
