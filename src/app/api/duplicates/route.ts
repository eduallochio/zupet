import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { getDismissals, groupFingerprint, saveDismissals } from "@/lib/duplicates";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getAdminSession(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** { action: "dismiss", ids: [...] } marca o grupo como "não são duplicadas"; { action: "restore", hash } desfaz. */
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const current = await getDismissals();

  if (body.action === "dismiss") {
    const ids = body.ids;
    if (!Array.isArray(ids) || ids.length < 2 || ids.length > 50 || !ids.every((i) => typeof i === "string" && UUID.test(i))) {
      return NextResponse.json({ error: "Grupo inválido" }, { status: 400 });
    }
    const hash = groupFingerprint(ids as string[]);
    if (current.some((d) => d.hash === hash)) return NextResponse.json({ ok: true, hash });
    const { error } = await saveDismissals([...current, { hash, by: session.email, at: new Date().toISOString() }], session.email);
    if (error) return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
    return NextResponse.json({ ok: true, hash });
  }

  if (body.action === "restore") {
    const hash = body.hash;
    if (typeof hash !== "string" || !/^[0-9a-f]{32}$/.test(hash)) {
      return NextResponse.json({ error: "Grupo inválido" }, { status: 400 });
    }
    const { error } = await saveDismissals(current.filter((d) => d.hash !== hash), session.email);
    if (error) return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}
