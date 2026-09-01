import { supabaseAdmin } from "@/lib/supabase-admin";
import PagamentosClient from "./PagamentosClient";

export const revalidate = 60;

async function getData() {
  const [
    { data: payments },
    { data: walkers },
    { data: owners },
  ] = await Promise.all([
    supabaseAdmin
      .from("walker_payments")
      .select("id, walker_id, owner_id, amount, billing_type, period_ref, status, paid_at, service_type, description, notes, created_at")
      .order("created_at", { ascending: false }),
    supabaseAdmin.from("walker_profiles").select("id, name"),
    supabaseAdmin.from("user_profiles").select("user_id, name"),
  ]);

  const walkerMap: Record<string, string> = {};
  for (const w of walkers ?? []) walkerMap[w.id] = w.name ?? "—";

  const ownerMap: Record<string, string> = {};
  for (const o of owners ?? []) ownerMap[o.user_id] = o.name ?? "—";

  return (payments ?? []).map((p) => ({
    id: p.id,
    walkerName: walkerMap[p.walker_id] ?? "—",
    ownerName: ownerMap[p.owner_id] ?? "—",
    amount: p.amount ?? 0,
    billingType: p.billing_type ?? "per_session",
    periodRef: p.period_ref ?? null,
    status: p.status as "pending" | "paid" | "cancelled",
    paidAt: p.paid_at ?? null,
    serviceType: p.service_type ?? null,
    description: p.description ?? null,
    notes: p.notes ?? null,
    createdAt: p.created_at,
  }));
}

export default async function PagamentosPage() {
  const payments = await getData();
  return <PagamentosClient payments={payments} />;
}
