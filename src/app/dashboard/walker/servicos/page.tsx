import { supabaseAdmin } from "@/lib/supabase-admin";
import ServicosClient from "./ServicosClient";

export const revalidate = 60;

async function getServicos() {
  const [{ data: services }, { data: walkers }] = await Promise.all([
    supabaseAdmin
      .from("walker_services")
      .select("id, walker_id, name, description, price, duration_minutes, active, created_at")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("walker_profiles")
      .select("id, name"),
  ]);

  const walkerMap: Record<string, string> = {};
  for (const w of walkers ?? []) {
    walkerMap[w.id] = w.name ?? "—";
  }

  const allServices = services ?? [];
  const totalServices = allServices.length;
  const activeServices = allServices.filter((s) => s.active).length;
  const inactiveServices = allServices.filter((s) => !s.active).length;
  const uniqueWalkers = new Set(allServices.map((s) => s.walker_id)).size;

  const rows = allServices.map((s) => ({
    id: s.id,
    walkerId: s.walker_id,
    walkerName: walkerMap[s.walker_id] ?? "—",
    name: s.name ?? "—",
    description: s.description ?? null,
    price: s.price ?? null,
    durationMinutes: s.duration_minutes ?? null,
    active: s.active ?? false,
    createdAt: s.created_at,
  }));

  return {
    totalServices,
    activeServices,
    inactiveServices,
    uniqueWalkers,
    rows,
  };
}

export default async function ServicosPage() {
  const data = await getServicos();
  return <ServicosClient data={data} />;
}
