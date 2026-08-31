import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function getAdminSession(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { price_full, price_promo, promo_active, promo_label } = body as Record<string, unknown>;

  if (typeof price_full !== "number" || price_full <= 0) {
    return NextResponse.json({ error: "price_full inválido" }, { status: 400 });
  }
  if (typeof price_promo !== "number" || price_promo <= 0) {
    return NextResponse.json({ error: "price_promo inválido" }, { status: 400 });
  }
  if (typeof promo_active !== "boolean") {
    return NextResponse.json({ error: "promo_active inválido" }, { status: 400 });
  }
  if (typeof promo_label !== "string" || promo_label.trim().length === 0) {
    return NextResponse.json({ error: "promo_label inválido" }, { status: 400 });
  }

  const value = {
    price_full,
    price_promo,
    promo_active,
    promo_label: promo_label.trim(),
    currency: "BRL",
  };

  const { error } = await supabaseAdmin
    .from("app_config")
    .upsert({
      key: "walker_pro_plan",
      value,
      updated_at: new Date().toISOString(),
      updated_by: session.email,
    });

  if (error) {
    console.error("[config] erro ao salvar:", error);
    return NextResponse.json({ error: "Erro ao salvar configuração" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, value });
}
