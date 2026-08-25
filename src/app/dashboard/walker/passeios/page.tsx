import { supabaseAdmin } from "@/lib/supabase-admin";
import PasseiosClient from "./PasseiosClient";

export const revalidate = 60;

async function getPasseios() {
  const [{ data: sessions }, { data: walkers }] = await Promise.all([
    supabaseAdmin
      .from("walk_sessions")
      .select("id, walker_id, started_at, ended_at, duration_minutes, distance_meters, pet_ids, created_at")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("walker_profiles")
      .select("id, name"),
  ]);

  const walkerMap: Record<string, string> = {};
  for (const w of walkers ?? []) {
    walkerMap[w.id] = w.name ?? "—";
  }

  const allSessions = sessions ?? [];
  const concluded = allSessions.filter((s) => s.ended_at !== null);
  const ongoing = allSessions.filter((s) => s.ended_at === null);

  const totalDistanceMeters = concluded.reduce((acc, s) => acc + (s.distance_meters ?? 0), 0);
  const totalDurationMinutes = concluded.reduce((acc, s) => acc + (s.duration_minutes ?? 0), 0);

  // Sessions per walker (top walkers by concluded sessions)
  const walkerCountMap: Record<string, number> = {};
  for (const s of concluded) {
    walkerCountMap[s.walker_id] = (walkerCountMap[s.walker_id] ?? 0) + 1;
  }

  // Sessions per month — last 6 months
  const now = new Date();
  const monthLabels: string[] = [];
  const monthKeys: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    monthLabels.push(
      d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").replace(/^\w/, (c) => c.toUpperCase())
    );
  }

  const monthCountMap: Record<string, number> = {};
  for (const key of monthKeys) monthCountMap[key] = 0;
  for (const s of concluded) {
    const d = new Date(s.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (key in monthCountMap) monthCountMap[key]++;
  }

  const sessionsByMonth = monthKeys.map((key, i) => ({
    month: monthLabels[i],
    Passeios: monthCountMap[key],
  }));

  // Recent 20 concluded sessions
  const recentSessions = concluded.slice(0, 20).map((s) => ({
    id: s.id,
    walkerName: walkerMap[s.walker_id] ?? "—",
    distanceMeters: s.distance_meters ?? 0,
    durationMinutes: s.duration_minutes ?? 0,
    petCount: Array.isArray(s.pet_ids) ? s.pet_ids.length : 0,
    createdAt: s.created_at,
  }));

  return {
    totalConcluded: concluded.length,
    totalOngoing: ongoing.length,
    totalDistanceMeters,
    totalDurationMinutes,
    sessionsByMonth,
    recentSessions,
  };
}

export default async function PasseiosPage() {
  const data = await getPasseios();
  return <PasseiosClient data={data} />;
}
