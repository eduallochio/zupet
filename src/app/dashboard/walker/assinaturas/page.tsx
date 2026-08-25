import { supabaseAdmin } from "@/lib/supabase-admin";
import AssinaturasClient from "./AssinaturasClient";

export const revalidate = 60;

async function getData() {
  const [
    { data: subs },
    { data: walkers },
    { data: proWalkers },
  ] = await Promise.all([
    supabaseAdmin
      .from("walker_subscriptions")
      .select("id, walker_id, plan, period_start, period_end, amount, status, payment_method, external_ref, paid_at, notes, created_at")
      .order("created_at", { ascending: false }),
    supabaseAdmin.from("walker_profiles").select("id, name, city, state, plan, active"),
    supabaseAdmin.from("walker_profiles").select("id").eq("plan", "pro"),
  ]);

  const walkerMap: Record<string, { name: string; location: string }> = {};
  for (const w of walkers ?? []) {
    walkerMap[w.id] = {
      name: w.name ?? "—",
      location: w.city && w.state ? `${w.city}, ${w.state}` : w.city ?? w.state ?? "—",
    };
  }

  const subscriptions = (subs ?? []).map((s) => ({
    id: s.id,
    walkerId: s.walker_id,
    walkerName: walkerMap[s.walker_id]?.name ?? "—",
    walkerLocation: walkerMap[s.walker_id]?.location ?? "—",
    plan: s.plan as string,
    periodStart: s.period_start,
    periodEnd: s.period_end,
    amount: s.amount ?? 0,
    status: s.status as "pending" | "paid" | "failed" | "cancelled" | "refunded",
    paymentMethod: s.payment_method ?? null,
    externalRef: s.external_ref ?? null,
    paidAt: s.paid_at ?? null,
    notes: s.notes ?? null,
    createdAt: s.created_at,
  }));

  const totalProWalkers = (proWalkers ?? []).length;
  const totalWalkers = (walkers ?? []).length;

  return { subscriptions, totalProWalkers, totalWalkers };
}

export default async function AssinaturasPage() {
  const data = await getData();
  return <AssinaturasClient data={data} />;
}
