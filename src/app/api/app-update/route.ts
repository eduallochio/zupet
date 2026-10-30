import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { compareVersions } from "@/lib/semver";

const VERSION_RE = /^\d+(\.\d+){0,2}$/;
const URL_RE = /^(https:\/\/|market:\/\/|itms-apps:\/\/)/;

async function getAdminSession(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const latest = typeof body.latest === "string" ? body.latest.trim() : "";
  const min = typeof body.min === "string" ? body.min.trim() : "";
  const iosUrl = typeof body.ios_url === "string" ? body.ios_url.trim() : "";
  const androidUrl = typeof body.android_url === "string" ? body.android_url.trim() : "";

  if (!VERSION_RE.test(latest)) return NextResponse.json({ error: "Versão mais recente inválida (use 1.34.0)" }, { status: 400 });
  if (min && !VERSION_RE.test(min)) return NextResponse.json({ error: "Versão mínima inválida (use 1.33.0)" }, { status: 400 });
  if (min && compareVersions(min, latest) > 0) {
    return NextResponse.json({ error: "A versão mínima não pode ser maior que a mais recente" }, { status: 400 });
  }
  if (iosUrl && !URL_RE.test(iosUrl)) return NextResponse.json({ error: "Link do iOS inválido" }, { status: 400 });
  if (androidUrl && !URL_RE.test(androidUrl)) return NextResponse.json({ error: "Link do Android inválido" }, { status: 400 });

  // Só grava o que foi preenchido; o app usa os links padrão das lojas quando ausentes
  const value: Record<string, string> = { latest };
  if (min) value.min = min;
  if (iosUrl) value.ios_url = iosUrl;
  if (androidUrl) value.android_url = androidUrl;

  const { error } = await supabaseAdmin.from("app_config").upsert({
    key: "app_update",
    value,
    updated_at: new Date().toISOString(),
    updated_by: session.email,
  });

  if (error) {
    console.error("[app-update] erro ao salvar:", error);
    return NextResponse.json({ error: "Erro ao salvar configuração" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, value });
}
