import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies(); // ✅ récupérer cookies de manière asynchrone
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // 1️⃣ Vérifie la session
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // 2️⃣ Va chercher le profil dans la table profiles
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, username, isActive")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Erreur récupération profil:", profileError.message);
    return NextResponse.json({ user, profile: null }, { status: 200 });
  }

  // 3️⃣ Retourne user + profil
  return NextResponse.json({ user, profile });
}
