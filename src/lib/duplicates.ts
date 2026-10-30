import { createHash } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Grupos marcados como "não são contas duplicadas" ficam em app_config (chave abaixo).
// app_config é legível publicamente, então NÃO guardamos IDs de usuários: só uma impressão digital (hash)
// do conjunto de IDs do grupo. Se entrar uma nova conta no grupo, a impressão muda e o alerta volta.
export const DUPLICATES_CONFIG_KEY = "duplicates_dismissed";

export type Dismissal = { hash: string; by: string; at: string };

export function groupFingerprint(ids: string[]): string {
  return createHash("sha256").update([...ids].sort().join("|")).digest("hex").slice(0, 32);
}

/** Agrupa contas com o mesmo nome (ignora vazio e "—"). Só devolve grupos com 2 ou mais contas. */
export function findDuplicateGroups<T extends { id: string; name: string }>(users: T[]): T[][] {
  const byName: Record<string, T[]> = {};
  for (const u of users) {
    const key = u.name.trim().toLowerCase();
    if (key === "—" || key === "") continue;
    (byName[key] ??= []).push(u);
  }
  return Object.values(byName).filter((group) => group.length > 1);
}

export async function getDismissals(): Promise<Dismissal[]> {
  const { data } = await supabaseAdmin.from("app_config").select("value").eq("key", DUPLICATES_CONFIG_KEY).maybeSingle();
  const items = (data?.value as { items?: unknown } | null)?.items;
  if (!Array.isArray(items)) return [];
  return items.filter(
    (i): i is Dismissal => !!i && typeof i.hash === "string" && typeof i.by === "string" && typeof i.at === "string"
  );
}

export async function saveDismissals(items: Dismissal[], by: string): Promise<{ error: string | null }> {
  const { error } = await supabaseAdmin.from("app_config").upsert({
    key: DUPLICATES_CONFIG_KEY,
    value: { items },
    updated_at: new Date().toISOString(),
    updated_by: by,
  });
  return { error: error ? error.message : null };
}

/** Separa os grupos atuais entre pendentes e já marcados como "não são duplicadas". */
export async function splitDuplicateGroups<T extends { id: string; name: string }>(users: T[]) {
  const [groups, dismissals] = await Promise.all([Promise.resolve(findDuplicateGroups(users)), getDismissals()]);
  const dismissed = new Set(dismissals.map((d) => d.hash));
  const withHash = groups.map((g) => ({ hash: groupFingerprint(g.map((u) => u.id)), users: g }));
  return {
    pending: withHash.filter((g) => !dismissed.has(g.hash)),
    ignored: withHash.filter((g) => dismissed.has(g.hash)),
  };
}
