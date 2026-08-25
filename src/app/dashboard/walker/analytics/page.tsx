import { supabaseAdmin } from "@/lib/supabase-admin";
import WalkerAnalyticsClient from "./WalkerAnalyticsClient";

export const revalidate = 60;

async function getData() {
  const now = new Date();

  const [
    { data: walkers },
    { data: sessions },
    { data: ratings },
    { data: payments },
    { data: services },
  ] = await Promise.all([
    supabaseAdmin.from("walker_profiles").select("id, plan, active, created_at"),
    supabaseAdmin.from("walk_sessions").select("id, ended_at, distance_meters, duration_minutes, created_at"),
    supabaseAdmin.from("walker_ratings").select("id, rating, created_at"),
    supabaseAdmin.from("walker_payments").select("id, amount, status, created_at"),
    supabaseAdmin.from("walker_services").select("id, active, created_at"),
  ]);

  // Últimos 6 meses
  const months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
    });
  }

  function monthKey(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  // Walkers por mês
  const walkersByMonth: Record<string, number> = Object.fromEntries(months.map((m) => [m.key, 0]));
  for (const w of walkers ?? []) {
    const k = monthKey(w.created_at);
    if (k in walkersByMonth) walkersByMonth[k]++;
  }

  // Passeios por mês (concluídos)
  const concluded = (sessions ?? []).filter((s) => s.ended_at !== null);
  const sessionsByMonth: Record<string, number> = Object.fromEntries(months.map((m) => [m.key, 0]));
  for (const s of concluded) {
    const k = monthKey(s.created_at);
    if (k in sessionsByMonth) sessionsByMonth[k]++;
  }

  // Km por mês
  const kmByMonth: Record<string, number> = Object.fromEntries(months.map((m) => [m.key, 0]));
  for (const s of concluded) {
    const k = monthKey(s.created_at);
    if (k in kmByMonth) kmByMonth[k] += (s.distance_meters ?? 0) / 1000;
  }

  // Receita por mês (pagamentos pagos)
  const paid = (payments ?? []).filter((p) => p.status === "paid");
  const revenueByMonth: Record<string, number> = Object.fromEntries(months.map((m) => [m.key, 0]));
  for (const p of paid) {
    const k = monthKey(p.created_at);
    if (k in revenueByMonth) revenueByMonth[k] += p.amount ?? 0;
  }

  // Avaliações por mês
  const ratingsByMonth: Record<string, number> = Object.fromEntries(months.map((m) => [m.key, 0]));
  for (const r of ratings ?? []) {
    const k = monthKey(r.created_at);
    if (k in ratingsByMonth) ratingsByMonth[k]++;
  }

  const chartData = months.map((m) => ({
    date: m.label,
    Walkers: walkersByMonth[m.key],
    Passeios: sessionsByMonth[m.key],
    "Km (×10)": Math.round(kmByMonth[m.key] / 10),
    Avaliações: ratingsByMonth[m.key],
    "Receita (R$)": Math.round(revenueByMonth[m.key]),
  }));

  // Distribuição plano
  const proCount = (walkers ?? []).filter((w) => w.plan === "pro").length;
  const freeCount = (walkers ?? []).filter((w) => w.plan !== "pro").length;

  // Médias gerais
  const avgRating = (ratings ?? []).length > 0
    ? +((ratings ?? []).reduce((a, r) => a + (r.rating ?? 0), 0) / (ratings ?? []).length).toFixed(1)
    : 0;
  const totalKm = Math.round(concluded.reduce((a, s) => a + (s.distance_meters ?? 0), 0) / 1000);
  const totalRevenue = paid.reduce((a, p) => a + (p.amount ?? 0), 0);
  const totalMinutes = concluded.reduce((a, s) => a + (s.duration_minutes ?? 0), 0);

  return {
    chartData,
    kpis: {
      totalWalkers: (walkers ?? []).length,
      activeWalkers: (walkers ?? []).filter((w) => w.active).length,
      proCount,
      freeCount,
      totalSessions: concluded.length,
      totalKm,
      avgRating,
      totalRatings: (ratings ?? []).length,
      totalRevenue,
      totalHours: +(totalMinutes / 60).toFixed(1),
      activeServices: (services ?? []).filter((s) => s.active).length,
    },
  };
}

export default async function WalkerAnalyticsPage() {
  const data = await getData();
  return <WalkerAnalyticsClient data={data} />;
}
