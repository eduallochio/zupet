import { supabaseAdmin } from "@/lib/supabase-admin";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  platform: "android" | "ios" | null;
  appVersion: string | null;
  updatedAt: string | null;
  hasExpoToken: boolean;
  hasFcmToken: boolean;
  pushEnabled: boolean | null;
};

/** Contas do app com os dados de dispositivo (plataforma, versão e tokens de push) de `user_profiles`. */
export async function getAppUsers(): Promise<AppUser[]> {
  const [{ data: profiles }, { data: { users: authUsers } }] = await Promise.all([
    supabaseAdmin
      .from("user_profiles")
      .select("user_id, name, platform, app_version, updated_at, expo_push_token, fcm_token, push_notifications_enabled"),
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const emailMap: Record<string, string> = {};
  for (const u of authUsers) emailMap[u.id] = u.email ?? "—";

  return (profiles ?? []).map((p) => ({
    id: p.user_id,
    name: p.name ?? "—",
    email: emailMap[p.user_id] ?? "—",
    platform: p.platform === "android" || p.platform === "ios" ? p.platform : null,
    appVersion: p.app_version || null,
    updatedAt: p.updated_at ?? null,
    hasExpoToken: !!p.expo_push_token,
    hasFcmToken: !!p.fcm_token,
    pushEnabled: p.push_notifications_enabled ?? null,
  }));
}
