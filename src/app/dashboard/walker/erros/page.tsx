import { supabaseAdmin } from "@/lib/supabase-admin";
import ErrosClient from "./ErrosClient";

export const revalidate = 60;

async function getErros() {
  const { data: allErrors } = await supabaseAdmin
    .from("app_errors")
    .select(
      "id, error_type, error_code, message, action, screen, app_version, platform, metadata, resolved, resolved_at, notes, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const errors = allErrors ?? [];

  const totalErrors = errors.length;
  const unresolvedErrors = errors.filter((e) => !e.resolved).length;
  const resolvedErrors = errors.filter((e) => e.resolved).length;

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last24hCount = errors.filter(
    (e) => new Date(e.created_at) >= last24h
  ).length;

  // Group by error_type
  const byType: Record<string, number> = {};
  for (const e of errors) {
    const t = e.error_type ?? "unknown";
    byType[t] = (byType[t] ?? 0) + 1;
  }

  // Sort: unresolved first, then by created_at desc (already ordered from DB)
  const recentErrors = [...errors]
    .sort((a, b) => {
      if (!!a.resolved === !!b.resolved) return 0;
      return a.resolved ? 1 : -1;
    })
    .slice(0, 30);

  return {
    totalErrors,
    unresolvedErrors,
    resolvedErrors,
    last24hCount,
    byType,
    recentErrors,
  };
}

export default async function ErrosPage() {
  const data = await getErros();
  return <ErrosClient data={data} />;
}
