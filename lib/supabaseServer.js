// lib/supabase-server.js
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export async function getSupabaseServer() {
  const cookieStore = await cookies(); // maintenant c’est asynchrone
  return createServerComponentClient({ cookies: () => cookieStore });
}
