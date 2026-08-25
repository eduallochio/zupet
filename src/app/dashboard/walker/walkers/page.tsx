import { supabaseAdmin } from "@/lib/supabase-admin";
import WalkersClient from "./WalkersClient";

export const revalidate = 60;

async function getWalkers() {
  const [
    { data: walkers },
    { data: services },
    { data: { users: authUsers } },
  ] = await Promise.all([
    supabaseAdmin
      .from("walker_profiles")
      .select("id, user_id, name, city, state, plan, rating, active, created_at"),
    supabaseAdmin.from("walker_services").select("walker_id, active"),
    supabaseAdmin.auth.admin.listUsers(),
  ]);

  const emailMap: Record<string, string> = {};
  for (const u of authUsers) emailMap[u.id] = u.email ?? "—";

  const serviceCountMap: Record<string, number> = {};
  for (const s of services ?? []) {
    serviceCountMap[s.walker_id] = (serviceCountMap[s.walker_id] ?? 0) + 1;
  }

  return (walkers ?? [])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((w) => ({
      id: w.id,
      name: w.name ?? "—",
      email: emailMap[w.user_id] ?? "—",
      location:
        w.city && w.state
          ? `${w.city}, ${w.state}`
          : w.city ?? w.state ?? "—",
      plan: (w.plan ?? "free") as "free" | "pro",
      rating: w.rating ?? null,
      services: serviceCountMap[w.id] ?? 0,
      active: w.active ?? false,
      createdAt: w.created_at,
    }));
}

export default async function WalkersPage() {
  const walkers = await getWalkers();
  return <WalkersClient walkers={walkers} />;
}
