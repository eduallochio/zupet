import { supabaseAdmin } from "@/lib/supabase-admin";
import PasseiosClient from "./PasseiosClient";

export const revalidate = 60;

async function getData() {
  const [
    { data: sessions },
    { data: walkers },
    { data: { users: authUsers } },
  ] = await Promise.all([
    supabaseAdmin
      .from("walk_sessions")
      .select("id, walker_id, owner_id, started_at, ended_at, duration_minutes, distance_meters, notes, pet_ids, created_at")
      .order("created_at", { ascending: false }),
    supabaseAdmin.from("walker_profiles").select("id, user_id, name"),
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const walkerMap: Record<string, string> = {};
  for (const w of walkers ?? []) walkerMap[w.id] = w.name ?? "—";

  const emailMap: Record<string, string> = {};
  for (const u of authUsers) emailMap[u.id] = u.email ?? "—";

  return (sessions ?? []).map((s) => ({
    id: s.id,
    walkerName: walkerMap[s.walker_id] ?? "—",
    ownerEmail: emailMap[s.owner_id ?? ""] ?? "—",
    startedAt: s.started_at,
    endedAt: s.ended_at,
    durationMinutes: s.duration_minutes ?? null,
    distanceMeters: s.distance_meters ?? null,
    petCount: Array.isArray(s.pet_ids) ? s.pet_ids.length : 0,
    notes: s.notes ?? null,
    createdAt: s.created_at,
  }));
}

export default async function PasseiosPage() {
  const sessions = await getData();
  return <PasseiosClient sessions={sessions} />;
}
