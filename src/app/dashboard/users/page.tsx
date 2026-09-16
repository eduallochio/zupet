import { supabaseAdmin } from "@/lib/supabase-admin";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";

async function getUsers() {
  const [{ data: profiles }, { data: petRows }, { data: { users: authUsers } }, { data: walkerProfiles }, { data: identities }] = await Promise.all([
    supabaseAdmin.from("user_profiles").select("user_id, name, city, state, platform, app_version, updated_at"),
    supabaseAdmin.from("pets").select("user_id"),
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
    supabaseAdmin.from("walker_profiles").select("user_id"),
    supabaseAdmin.from("identities").select("user_id, provider"),
  ]);

  const walkerUserIds = new Set((walkerProfiles ?? []).map((w) => w.user_id));

  const profileMap: Record<string, typeof profiles extends (infer T)[] | null ? T : never> = {};
  for (const p of profiles ?? []) profileMap[p.user_id] = p;

  const countMap: Record<string, number> = {};
  for (const p of petRows ?? []) countMap[p.user_id] = (countMap[p.user_id] ?? 0) + 1;

  const providersMap: Record<string, string[]> = {};
  for (const i of identities ?? []) {
    if (!providersMap[i.user_id]) providersMap[i.user_id] = [];
    providersMap[i.user_id].push(i.provider);
  }

  // Base: auth.users — garante que todos os usuários aparecem, mesmo sem perfil criado
  return authUsers
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((u) => {
      const profile = profileMap[u.id];
      return {
        id: u.id,
        name: profile?.name ?? u.user_metadata?.name ?? u.user_metadata?.full_name ?? "—",
        email: u.email ?? "—",
        location: profile?.city && profile?.state
          ? `${profile.city}, ${profile.state}`
          : profile?.city ?? profile?.state ?? "—",
        pets: countMap[u.id] ?? 0,
        createdAt: u.created_at,
        platform: (profile?.platform as "android" | "ios" | null) ?? null,
        appVersion: profile?.app_version ?? null,
        isWalker: walkerUserIds.has(u.id),
        providers: providersMap[u.id] ?? [],
      };
    });
}

export default async function UsersPage() {
  const users = await getUsers();
  return <UsersClient users={users} />;
}
