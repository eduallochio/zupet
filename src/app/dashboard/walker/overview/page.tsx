import { supabaseAdmin } from "@/lib/supabase-admin";
import WalkerOverviewClient from "./WalkerOverviewClient";

export const revalidate = 60;

async function getWalkerStats() {
  const [
    { data: walkerProfiles },
    { data: walkSessions },
    { data: walkerRatings },
    { data: walkerServices },
    { data: walkerPayments },
  ] = await Promise.all([
    supabaseAdmin.from("walker_profiles").select("id, name, plan, active, created_at"),
    supabaseAdmin.from("walk_sessions").select("id, ended_at, distance_meters, duration_minutes, created_at"),
    supabaseAdmin.from("walker_ratings").select("id, rating, created_at"),
    supabaseAdmin.from("walker_services").select("id, active"),
    supabaseAdmin.from("walker_payments").select("id, amount, status, created_at"),
  ]);

  const profiles = walkerProfiles ?? [];
  const sessions = walkSessions ?? [];
  const ratings = walkerRatings ?? [];
  const services = walkerServices ?? [];
  const payments = walkerPayments ?? [];

  const now = new Date();
  const days30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const concluded = sessions.filter((s) => s.ended_at !== null);
  const totalKm = Math.round(concluded.reduce((acc, s) => acc + (s.distance_meters ?? 0), 0) / 1000);
  const totalMinutes = concluded.reduce((acc, s) => acc + (s.duration_minutes ?? 0), 0);
  const avgRating = ratings.length > 0
    ? +(ratings.reduce((acc, r) => acc + (r.rating ?? 0), 0) / ratings.length).toFixed(1)
    : 0;

  const newWalkersThisMonth = profiles.filter((w) => new Date(w.created_at) >= days30).length;
  const paidAmount = payments.filter((p) => p.status === "paid").reduce((acc, p) => acc + (p.amount ?? 0), 0);
  const pendingAmount = payments.filter((p) => p.status === "pending").reduce((acc, p) => acc + (p.amount ?? 0), 0);

  // Crescimento de walkers por mês (últimos 6 meses)
  const monthlyData: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    monthlyData[label] = 0;
  }
  for (const w of profiles) {
    const d = new Date(w.created_at);
    const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    if (label in monthlyData) monthlyData[label]++;
  }
  const walkerGrowthData = Object.entries(monthlyData).map(([date, Walkers]) => ({ date, Walkers }));

  // Passeios por mês (últimos 6 meses)
  const sessionMonthlyData: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    sessionMonthlyData[label] = 0;
  }
  for (const s of concluded) {
    const d = new Date(s.created_at);
    const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    if (label in sessionMonthlyData) sessionMonthlyData[label]++;
  }
  const sessionGrowthData = Object.entries(sessionMonthlyData).map(([date, Passeios]) => ({ date, Passeios }));

  return {
    totalWalkers: profiles.length,
    activeWalkers: profiles.filter((w) => w.active).length,
    proWalkers: profiles.filter((w) => w.plan === "pro").length,
    newWalkersThisMonth,
    totalSessions: concluded.length,
    ongoingSessions: sessions.filter((s) => s.ended_at === null).length,
    totalKm,
    totalMinutes,
    avgRating,
    totalRatings: ratings.length,
    activeServices: services.filter((s) => s.active).length,
    totalServices: services.length,
    paidAmount,
    pendingAmount,
    walkerGrowthData,
    sessionGrowthData,
  };
}

export default async function WalkerOverviewPage() {
  const stats = await getWalkerStats();
  return <WalkerOverviewClient stats={stats} />;
}
