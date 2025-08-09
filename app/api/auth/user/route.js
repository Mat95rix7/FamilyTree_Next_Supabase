import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, username, isActive")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Erreur récupération profil:", profileError.message);
    return NextResponse.json({ user, profile: null }, { status: 200 });
  }

  return NextResponse.json({ user, profile });
}
