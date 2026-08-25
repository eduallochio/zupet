import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const { walkerId, plan, note } = await req.json();
  if (!walkerId || !plan) return NextResponse.json({ error: "walkerId e plan obrigatórios" }, { status: 400 });
  if (plan !== "free" && plan !== "pro") return NextResponse.json({ error: "plan deve ser free ou pro" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("walker_profiles")
    .update({ plan })
    .eq("id", walkerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Registra log de auditoria na walker_subscriptions com status manual
  if (plan === "pro") {
    await supabaseAdmin.from("walker_subscriptions").insert({
      walker_id: walkerId,
      plan: "pro",
      status: "paid",
      payment_method: "manual",
      amount: 0,
      external_ref: note ? `manual: ${note}` : "manual: liberado pelo admin",
      period_start: new Date().toISOString().slice(0, 10),
      period_end: null,
      paid_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ ok: true });
}
