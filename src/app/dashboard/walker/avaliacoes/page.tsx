import { supabaseAdmin } from "@/lib/supabase-admin";
import AvaliacoesClient from "./AvaliacoesClient";

export const revalidate = 60;

async function getData() {
  const [
    { data: ratings },
    { data: walkers },
    { data: { users: authUsers } },
  ] = await Promise.all([
    supabaseAdmin
      .from("walker_ratings")
      .select("id, walker_id, owner_id, session_id, rating, comment, created_at")
      .order("created_at", { ascending: false }),
    supabaseAdmin.from("walker_profiles").select("id, name"),
    supabaseAdmin.auth.admin.listUsers(),
  ]);

  const walkerMap: Record<string, string> = {};
  for (const w of walkers ?? []) walkerMap[w.id] = w.name ?? "—";

  const emailMap: Record<string, string> = {};
  for (const u of authUsers) emailMap[u.id] = u.email ?? "—";

  return (ratings ?? []).map((r) => ({
    id: r.id,
    walkerName: walkerMap[r.walker_id] ?? "—",
    ownerEmail: emailMap[r.owner_id] ?? "—",
    rating: r.rating as number,
    comment: r.comment ?? null,
    sessionId: r.session_id ?? null,
    createdAt: r.created_at,
  }));
}

export default async function AvaliacoesPage() {
  const ratings = await getData();
  return <AvaliacoesClient ratings={ratings} />;
}
