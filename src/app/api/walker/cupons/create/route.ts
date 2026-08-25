import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const { code, description, discount_pct, discount_brl, max_uses, valid_until } = await req.json();

  if (!code) return NextResponse.json({ error: "Código obrigatório" }, { status: 400 });
  if (!discount_pct && !discount_brl) return NextResponse.json({ error: "Informe discount_pct ou discount_brl" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("walker_coupons")
    .insert({
      code: code.trim().toUpperCase(),
      description: description ?? null,
      discount_pct: discount_pct ?? null,
      discount_brl: discount_brl ?? null,
      max_uses: max_uses ?? null,
      valid_until: valid_until ?? null,
      active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
