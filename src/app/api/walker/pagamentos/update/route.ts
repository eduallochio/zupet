import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const { id, amount, notes } = await req.json();
  if (!id || amount == null) return NextResponse.json({ error: "id e amount obrigatórios" }, { status: 400 });
  if (typeof amount !== "number" || amount < 0) return NextResponse.json({ error: "amount inválido" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("walker_payments")
    .update({ amount, notes: notes ?? null, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
