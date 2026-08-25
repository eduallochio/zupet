import { supabaseAdmin } from "@/lib/supabase-admin";
import PagamentosClient from "./PagamentosClient";

export const revalidate = 60;

async function getPagamentos() {
  const [{ data: payments }, { data: walkers }] = await Promise.all([
    supabaseAdmin
      .from("walker_payments")
      .select(
        "id, walker_id, amount, status, service_type, description, paid_at, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(20),
    supabaseAdmin.from("walker_profiles").select("id, name"),
  ]);

  const walkerMap: Record<string, string> = {};
  for (const w of walkers ?? []) {
    walkerMap[w.id] = w.name ?? "—";
  }

  // Compute totals from all payments (re-query without limit for accurate totals)
  const { data: allPayments } = await supabaseAdmin
    .from("walker_payments")
    .select("amount, status");

  const totalAmount = (allPayments ?? []).reduce(
    (sum, p) => sum + (p.amount ?? 0),
    0
  );
  const paidAmount = (allPayments ?? [])
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const pendingAmount = (allPayments ?? [])
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);

  const recentPayments = (payments ?? []).map((p) => ({
    id: p.id,
    walkerId: p.walker_id,
    walkerName: walkerMap[p.walker_id] ?? "—",
    amount: p.amount ?? 0,
    status: p.status ?? "pending",
    serviceType: p.service_type ?? null,
    description: p.description ?? null,
    paidAt: p.paid_at ?? null,
    createdAt: p.created_at,
  }));

  return {
    totalAmount,
    paidAmount,
    pendingAmount,
    totalCount: (allPayments ?? []).length,
    recentPayments,
  };
}

export default async function PagamentosPage() {
  const data = await getPagamentos();
  return <PagamentosClient data={data} />;
}
