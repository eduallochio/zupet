import { supabaseAdmin } from "@/lib/supabase-admin";
import OverviewClient from "./OverviewClient";

export const revalidate = 60; // ISR: regenera a página a cada 60 segundos

async function getStats() {
  const [profilesResult, petsResult, { data: { users: authUsers } }] = await Promise.all([
    supabaseAdmin.from("user_profiles").select("user_id, name, updated_at"),
    supabaseAdmin.from("pets").select("id, user_id, species, created_at"),
    supabaseAdmin.auth.admin.listUsers(),
  ]);

  const now = new Date();
  const days30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const days60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const pets = petsResult.data ?? [];

  const newUsersThisMonth = authUsers.filter((u) => new Date(u.created_at) >= days30).length;
  const newUsersLastMonth = authUsers.filter((u) => new Date(u.created_at) >= days60 && new Date(u.created_at) < days30).length;
  const newPetsThisMonth = pets.filter((p) => new Date(p.created_at) >= days30).length;

  const userGrowth = newUsersLastMonth > 0
    ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100)
    : newUsersThisMonth > 0 ? 100 : 0;

  // Espécies para DonutChart
  const speciesMap: Record<string, number> = {};
  for (const p of pets) {
    const s = p.species ?? "Outros";
    speciesMap[s] = (speciesMap[s] ?? 0) + 1;
  }
  const speciesData = Object.entries(speciesMap).map(([name, value]) => ({ name, value }));

  // Crescimento de usuários por mês (últimos 6 meses)
  const monthlyData: Record<string, { Usuários: number; Pets: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    monthlyData[label] = { Usuários: 0, Pets: 0 };
  }
  for (const u of authUsers) {
    const d = new Date(u.created_at);
    const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    if (monthlyData[label]) monthlyData[label].Usuários++;
  }
  for (const p of pets) {
    const d = new Date(p.created_at);
    const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    if (monthlyData[label]) monthlyData[label].Pets++;
  }
  const chartData = Object.entries(monthlyData).map(([date, vals]) => ({ date, ...vals }));

  // Email map
  const emailMap: Record<string, string> = {};
  for (const u of authUsers) emailMap[u.id] = u.email ?? "";

  const recentUsers = (profilesResult.data ?? []).slice(0, 5).map((p) => ({
    name: p.name ?? emailMap[p.user_id] ?? "—",
    value: emailMap[p.user_id] ?? "—",
  }));

  return {
    totalUsers: authUsers.length,
    totalPets: pets.length,
    newUsersThisMonth,
    newPetsThisMonth,
    userGrowth,
    avgPets: authUsers.length > 0 ? +(pets.length / authUsers.length).toFixed(1) : 0,
    speciesData,
    chartData,
    recentUsers,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();
  return <OverviewClient stats={stats} />;
}
