import { supabaseAdmin } from "@/lib/supabase-admin";
import { compareVersions, compareVersionsDesc } from "@/lib/semver";
import OverviewClient from "./OverviewClient";

export const revalidate = 60; // ISR: regenera a página a cada 60 segundos

const TZ = "America/Sao_Paulo";
const DAY_MS = 24 * 60 * 60 * 1000;
const SERIES_DAYS = 180; // 90 dias do período mais 90 anteriores, para calcular a tendência

// Dia (aaaa-mm-dd) no fuso do Brasil, para os cadastros não "virarem de dia" em UTC
const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ });

async function getStats() {
  const [profilesRes, petsRes, errorsRes, deletionsRes, walkersRes, walksRes] = await Promise.all([
    supabaseAdmin
      .from("user_profiles")
      .select("user_id, name, updated_at, app_version, expo_push_token, fcm_token, push_notifications_enabled"),
    supabaseAdmin.from("pets").select("id, user_id, species, created_at"),
    supabaseAdmin.from("app_errors").select("id", { count: "exact", head: true }).eq("app", "zupet").eq("resolved", false),
    supabaseAdmin.from("deletion_requests").select("id", { count: "exact", head: true }).in("status", ["pending", "processing"]),
    supabaseAdmin.from("walker_profiles").select("plan, created_at"),
    supabaseAdmin.from("walk_sessions").select("ended_at, distance_meters"),
  ]);

  // listUsers retorna no máximo 1000 por página — paginar até buscar todos
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authUsers: any[] = [];
  let page = 1;
  while (true) {
    const { data } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (!data?.users?.length) break;
    authUsers.push(...data.users);
    if (data.users.length < 1000) break;
    page++;
  }

  const now = new Date();
  const profiles = profilesRes.data ?? [];
  const pets = petsRes.data ?? [];

  // ── Série diária de cadastros (usuários e pets) ──────────────────────────
  const series: Record<string, { users: number; pets: number }> = {};
  for (let i = SERIES_DAYS - 1; i >= 0; i--) series[dayKey(new Date(now.getTime() - i * DAY_MS))] = { users: 0, pets: 0 };
  for (const u of authUsers) {
    const k = dayKey(new Date(u.created_at));
    if (series[k]) series[k].users++;
  }
  for (const p of pets) {
    const k = dayKey(new Date(p.created_at));
    if (series[k]) series[k].pets++;
  }
  const dailySeries = Object.entries(series).map(([date, v]) => ({ date, users: v.users, pets: v.pets }));

  // ── Espécies ────────────────────────────────────────────────────────────
  const speciesMap: Record<string, number> = {};
  for (const p of pets) {
    const s = p.species ?? "Outros";
    speciesMap[s] = (speciesMap[s] ?? 0) + 1;
  }
  const speciesData = Object.entries(speciesMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // ── Usuários ativos (abriram o app: o perfil é atualizado a cada abertura) ──
  const activeSince = (days: number) => profiles.filter((p) => p.updated_at && new Date(p.updated_at).getTime() >= now.getTime() - days * DAY_MS).length;

  // ── Itens de "Atenção agora" ────────────────────────────────────────────
  const versions = profiles.map((p) => p.app_version).filter((v): v is string => !!v);
  const latestVersion = [...versions].sort(compareVersionsDesc)[0] ?? null;
  const outdatedUsers = latestVersion ? versions.filter((v) => compareVersions(v, latestVersion) < 0).length : 0;
  const noPushUsers = profiles.filter((p) => p.push_notifications_enabled !== false && !p.expo_push_token && !p.fcm_token).length;

  const nameById: Record<string, string> = {};
  for (const p of profiles) if (p.name) nameById[p.user_id] = p.name;
  const byName: Record<string, number> = {};
  for (const u of authUsers) {
    const name = (nameById[u.id] ?? u.user_metadata?.name ?? u.user_metadata?.full_name ?? "").trim().toLowerCase();
    if (name) byName[name] = (byName[name] ?? 0) + 1;
  }
  const duplicateGroups = Object.values(byName).filter((n) => n > 1).length;

  // ── Usuários mais recentes (pela data de cadastro) ──────────────────────
  const recentUsers = [...authUsers]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((u) => ({
      id: u.id as string,
      name: (nameById[u.id] ?? u.user_metadata?.name ?? u.user_metadata?.full_name ?? u.email ?? "—") as string,
      email: (u.email ?? "—") as string,
      createdAt: u.created_at as string,
    }));

  // ── Resumo do walker ────────────────────────────────────────────────────
  const walkers = walkersRes.data ?? [];
  const walks = (walksRes.data ?? []).filter((w) => w.ended_at !== null);
  const walker = {
    total: walkers.length,
    new30d: walkers.filter((w) => new Date(w.created_at).getTime() >= now.getTime() - 30 * DAY_MS).length,
    pro: walkers.filter((w) => w.plan === "pro").length,
    walks: walks.length,
    km: Math.round(walks.reduce((acc, w) => acc + (w.distance_meters ?? 0), 0) / 1000),
  };

  return {
    generatedAt: now.toISOString(),
    totalUsers: authUsers.length,
    totalPets: pets.length,
    avgPets: authUsers.length > 0 ? +(pets.length / authUsers.length).toFixed(1) : 0,
    active7d: activeSince(7),
    active30d: activeSince(30),
    dailySeries,
    speciesData,
    recentUsers,
    attention: {
      pendingErrors: errorsRes.count ?? 0,
      outdatedUsers,
      latestVersion,
      noPushUsers,
      pendingDeletions: deletionsRes.count ?? 0,
      duplicateGroups,
    },
    walker,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();
  return <OverviewClient stats={stats} />;
}
