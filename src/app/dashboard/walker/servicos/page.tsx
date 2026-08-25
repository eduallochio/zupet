import { supabaseAdmin } from "@/lib/supabase-admin";
import ServicosClient from "./ServicosClient";

export const revalidate = 60;

async function getData() {
  const [
    { data: services },
    { data: walkers },
  ] = await Promise.all([
    supabaseAdmin
      .from("walker_services")
      .select("id, walker_id, type, label, description, price, price_daily, price_weekly, price_biweekly, price_monthly, billing_type, duration_minutes, max_pets, active, created_at")
      .order("created_at", { ascending: false }),
    supabaseAdmin.from("walker_profiles").select("id, name, city, state"),
  ]);

  const walkerMap: Record<string, { name: string; location: string }> = {};
  for (const w of walkers ?? []) {
    walkerMap[w.id] = {
      name: w.name ?? "—",
      location: w.city && w.state ? `${w.city}, ${w.state}` : w.city ?? w.state ?? "—",
    };
  }

  return (services ?? []).map((s) => ({
    id: s.id,
    walkerName: walkerMap[s.walker_id]?.name ?? "—",
    walkerLocation: walkerMap[s.walker_id]?.location ?? "—",
    type: s.type ?? "—",
    label: s.label ?? null,
    description: s.description ?? null,
    price: s.price ?? 0,
    priceDaily: s.price_daily ?? null,
    priceWeekly: s.price_weekly ?? null,
    priceBiweekly: s.price_biweekly ?? null,
    priceMonthly: s.price_monthly ?? null,
    billingType: s.billing_type ?? "per_session",
    durationMinutes: s.duration_minutes ?? null,
    maxPets: s.max_pets ?? null,
    active: s.active ?? false,
    createdAt: s.created_at,
  }));
}

export default async function ServicosPage() {
  const services = await getData();
  return <ServicosClient services={services} />;
}
