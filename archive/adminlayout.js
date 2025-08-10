import { redirect } from "next/navigation";
import { getSupabaseServer } from "../lib/supabaseServer";

export default async function AdminLayout({ children }) {
  const supabase = await getSupabaseServer();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    redirect("/");
  }

  return <>{children}</>;
}
