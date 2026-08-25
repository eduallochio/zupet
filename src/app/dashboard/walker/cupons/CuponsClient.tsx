"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ticket, TrendingDown, Users, CheckCircle2, Plus, X } from "lucide-react";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discountPct: number | null;
  discountBrl: number | null;
  maxUses: number | null;
  usedCount: number;
  validFrom: string | null;
  validUntil: string | null;
  active: boolean;
  createdAt: string;
  uses: number;
  totalDiscount: number;
  totalRevenue: number;
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR");
}

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function DiscountBadge({ pct, brl }: { pct: number | null; brl: number | null }) {
  const label = pct ? `${pct}% off` : brl ? `R$ ${brl.toFixed(2)} off` : "—";
  return <Badge className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10 font-mono">{label}</Badge>;
}

function ToggleButton({ coupon, onToggle }: { coupon: Coupon; onToggle: (id: string, active: boolean) => void }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(async () => {
        await fetch("/api/walker/cupons/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: coupon.id, active: !coupon.active }),
        });
        onToggle(coupon.id, !coupon.active);
      })}
      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors disabled:opacity-50 ${
        coupon.active
          ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-700 hover:border-rose-500/30"
          : "bg-secondary text-muted-foreground border border-border hover:bg-emerald-500/10 hover:text-emerald-700 hover:border-emerald-500/30"
      }`}
    >
      {isPending ? "…" : coupon.active ? "Ativo" : "Inativo"}
    </button>
  );
}

export default function CuponsClient({ coupons: initial }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    code: "", description: "", type: "pct" as "pct" | "brl",
    discount_pct: "", discount_brl: "", max_uses: "", valid_until: "",
  });
  const [formError, setFormError] = useState("");

  function handleToggle(id: string, active: boolean) {
    setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, active } : c));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    startTransition(async () => {
      const body: Record<string, unknown> = {
        code: form.code.trim().toUpperCase(),
        description: form.description || null,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        valid_until: form.valid_until || null,
      };
      if (form.type === "pct") body.discount_pct = parseInt(form.discount_pct);
      else body.discount_brl = parseFloat(form.discount_brl);

      const res = await fetch("/api/walker/cupons/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error ?? "Erro ao criar cupom"); return; }
      setShowForm(false);
      setForm({ code: "", description: "", type: "pct", discount_pct: "", discount_brl: "", max_uses: "", valid_until: "" });
      router.refresh();
    });
  }

  const totalUses = coupons.reduce((a, c) => a + c.uses, 0);
  const totalDiscount = coupons.reduce((a, c) => a + c.totalDiscount, 0);
  const activeCount = coupons.filter((c) => c.active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Cupons de Desconto</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie cupons para atrair novos walkers ao plano Pro</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          {showForm ? <><X className="h-4 w-4" />Cancelar</> : <><Plus className="h-4 w-4" />Novo cupom</>}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Ticket className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-heading font-bold">{coupons.length}</p><p className="text-xs text-muted-foreground">Total</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
            <div><p className="text-2xl font-heading font-bold">{activeCount}</p><p className="text-xs text-muted-foreground">Ativos</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center"><Users className="h-5 w-5 text-violet-600" /></div>
            <div><p className="text-2xl font-heading font-bold">{totalUses}</p><p className="text-xs text-muted-foreground">Usos totais</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><TrendingDown className="h-5 w-5 text-amber-600" /></div>
            <div><p className="text-lg font-heading font-bold">{fmtBRL(totalDiscount)}</p><p className="text-xs text-muted-foreground">Desc. concedido</p></div>
          </div>
        </CardContent></Card>
      </div>

      {/* Formulário de criação */}
      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Novo Cupom</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">CÓDIGO *</label>
                <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="EX: WALKER30"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">TIPO DE DESCONTO</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "pct" | "brl" })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="pct">Percentual (%)</option>
                  <option value="brl">Valor fixo (R$)</option>
                </select>
              </div>
              <div>
                {form.type === "pct" ? (
                  <>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">DESCONTO (%) *</label>
                    <input required type="number" min={1} max={100} value={form.discount_pct}
                      onChange={(e) => setForm({ ...form, discount_pct: e.target.value })} placeholder="30"
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </>
                ) : (
                  <>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">DESCONTO (R$) *</label>
                    <input required type="number" min={0.01} step="0.01" value={form.discount_brl}
                      onChange={(e) => setForm({ ...form, discount_brl: e.target.value })} placeholder="10.00"
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </>
                )}
              </div>
              <div className="col-span-2 md:col-span-3">
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">DESCRIÇÃO INTERNA</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ex: Campanha Instagram agosto/26"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">USO MÁXIMO</label>
                <input type="number" min={1} value={form.max_uses}
                  onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="Ilimitado"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">VÁLIDO ATÉ</label>
                <input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              {formError && <p className="col-span-2 md:col-span-3 text-xs text-destructive">{formError}</p>}
              <div className="col-span-2 md:col-span-3 flex justify-end">
                <button type="submit" disabled={isPending}
                  className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {isPending ? "Criando…" : "Criar cupom"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tabela */}
      <Card>
        <CardHeader><CardTitle>Todos os Cupons</CardTitle></CardHeader>
        {/* Mobile */}
        <div className="md:hidden divide-y divide-border">
          {coupons.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">Nenhum cupom cadastrado</p>
          ) : coupons.map((c) => (
            <div key={c.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-mono font-bold">{c.code}</p>
                  {c.description && <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>}
                </div>
                <ToggleButton coupon={c} onToggle={handleToggle} />
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <DiscountBadge pct={c.discountPct} brl={c.discountBrl} />
                <span className="text-xs text-muted-foreground">{c.uses} uso{c.uses !== 1 ? "s" : ""}{c.maxUses ? ` / ${c.maxUses}` : ""}</span>
                {c.validUntil && <span className="text-xs text-muted-foreground">até {fmtDate(c.validUntil)}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop */}
        <CardContent className="p-0 hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Código</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Desc. total</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12 text-sm">Nenhum cupom cadastrado</TableCell></TableRow>
              ) : coupons.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="pl-6">
                    <p className="font-mono font-bold text-sm">{c.code}</p>
                    {c.description && <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>}
                  </TableCell>
                  <TableCell><DiscountBadge pct={c.discountPct} brl={c.discountBrl} /></TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {c.uses}{c.maxUses !== null ? <span className="text-muted-foreground"> / {c.maxUses}</span> : ""}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums text-amber-600">{c.totalDiscount > 0 ? fmtBRL(c.totalDiscount) : "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.validUntil ? `até ${fmtDate(c.validUntil)}` : "Sem expiração"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{fmtDate(c.createdAt)}</TableCell>
                  <TableCell className="pr-6"><ToggleButton coupon={c} onToggle={handleToggle} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
