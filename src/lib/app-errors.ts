import { supabaseAdmin } from "@/lib/supabase-admin";
import type { AppError } from "@/components/ErrorsClient";

/** Erros registrados na tabela compartilhada `app_errors`; `app` separa o tutor ("zupet") do walker ("zupet-walker"). */
export async function getAppErrors(app: "zupet" | "zupet-walker"): Promise<AppError[]> {
  const { data: errors } = await supabaseAdmin
    .from("app_errors")
    .select("id, user_id, error_type, error_code, message, stack_trace, screen, action, app_version, platform, os_version, resolved, resolved_at, notes, created_at")
    .eq("app", app)
    .order("created_at", { ascending: false })
    .limit(500);

  const {
    data: { users: authUsers },
  } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const emailMap: Record<string, string> = {};
  for (const u of authUsers) emailMap[u.id] = u.email ?? "—";

  return (errors ?? []).map((e) => ({
    id: e.id,
    userEmail: e.user_id ? (emailMap[e.user_id] ?? e.user_id.slice(0, 8) + "…") : "anônimo",
    errorType: e.error_type,
    errorCode: e.error_code ?? null,
    message: e.message,
    stackTrace: e.stack_trace ?? null,
    screen: e.screen ?? null,
    action: e.action ?? null,
    appVersion: e.app_version ?? null,
    platform: e.platform ?? null,
    osVersion: e.os_version ?? null,
    resolved: e.resolved ?? false,
    resolvedAt: e.resolved_at ?? null,
    notes: e.notes ?? null,
    createdAt: e.created_at,
  }));
}
