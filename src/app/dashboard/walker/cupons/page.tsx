import { supabaseAdmin } from "@/lib/supabase-admin";
import CuponsClient from "./CuponsClient";

export const revalidate = 60;

async function getData() {
  const [{ data: coupons }, { data: uses }] = await Promise.all([
    supabaseAdmin
      .from("walker_coupons")
      .select("id, code, description, discount_pct, discount_brl, max_uses, used_count, valid_from, valid_until, active, created_at")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("walker_coupon_uses")
      .select("coupon_id, discount_amount, final_amount, used_at"),
  ]);

  // Agrupar métricas por cupom
  const usesMap: Record<string, { count: number; totalDiscount: number; totalRevenue: number }> = {};
  for (const u of uses ?? []) {
    if (!usesMap[u.coupon_id]) usesMap[u.coupon_id] = { count: 0, totalDiscount: 0, totalRevenue: 0 };
    usesMap[u.coupon_id].count++;
    usesMap[u.coupon_id].totalDiscount += u.discount_amount ?? 0;
    usesMap[u.coupon_id].totalRevenue += u.final_amount ?? 0;
  }

  return (coupons ?? []).map((c) => ({
    id: c.id,
    code: c.code,
    description: c.description ?? null,
    discountPct: c.discount_pct ?? null,
    discountBrl: c.discount_brl ?? null,
    maxUses: c.max_uses ?? null,
    usedCount: c.used_count ?? 0,
    validFrom: c.valid_from ?? null,
    validUntil: c.valid_until ?? null,
    active: c.active ?? false,
    createdAt: c.created_at,
    uses: usesMap[c.id]?.count ?? 0,
    totalDiscount: usesMap[c.id]?.totalDiscount ?? 0,
    totalRevenue: usesMap[c.id]?.totalRevenue ?? 0,
  }));
}

export default async function CuponsPage() {
  const coupons = await getData();
  return <CuponsClient coupons={coupons} />;
}
