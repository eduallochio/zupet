import { supabaseAdmin } from "@/lib/supabase-admin";
import AtualizacaoClient from "./AtualizacaoClient";

export const revalidate = 0;

export default async function AtualizacaoPage() {
  const [{ data: cfg }, { data: profiles }] = await Promise.all([
    supabaseAdmin.from("app_config").select("value, updated_at, updated_by").eq("key", "app_update").maybeSingle(),
    supabaseAdmin.from("user_profiles").select("app_version"),
  ]);

  const versionCounts: Record<string, number> = {};
  let withoutVersion = 0;
  for (const p of profiles ?? []) {
    if (p.app_version) versionCounts[p.app_version] = (versionCounts[p.app_version] ?? 0) + 1;
    else withoutVersion++;
  }

  const value = (cfg?.value ?? {}) as { latest?: string; min?: string; ios_url?: string; android_url?: string };

  return (
    <AtualizacaoClient
      config={{ latest: value.latest ?? "", min: value.min ?? "", iosUrl: value.ios_url ?? "", androidUrl: value.android_url ?? "" }}
      lastUpdated={cfg?.updated_at ?? null}
      lastUpdatedBy={cfg?.updated_by ?? null}
      versionCounts={versionCounts}
      withoutVersion={withoutVersion}
    />
  );
}
