"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, CreditCard, TrendingUp, Users, AlertCircle, Info } from "lucide-react";

const PAGE_SIZE = 20;

type Subscription = {
  id: string;
  walkerId: string;
  walkerName: string;
  walkerLocation: string;
  plan: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "cancelled" | "refunded";
  paymentMethod: string | null;
  externalRef: string | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
};

type Props = {
  data: {
    subscriptions: Subscription[];
    totalProWalkers: number;
    totalWalkers: number;
  };
};

const STATUS_FILTERS = ["todos", "paid", "pending", "failed", "cancelled"] as const;
type Filter = typeof STATUS_FILTERS[number];

const STATUS_CONFIG = {
  paid: { label: "Pago", cls: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" },
  pending: { label: "Pendente", cls: "bg-amber-500/10 text-amber-700 border-amber-500/30" },
  failed: { label: "Falhou", cls: "bg-rose-500/10 text-rose-700 border-rose-500/30" },
  cancelled: { label: "Cancelado", cls: "bg-secondary text-muted-foreground" },
  refunded: { label: "Reembolsado", cls: "bg-blue-500/10 text-blue-700 border-blue-500/30" },
};

function StatusBadge({ status }: { status: Subscription["status"] }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, cls: "bg-secondary text-muted-foreground" };
  return <Badge className={`text-xs hover:${cfg.cls} ${cfg.cls}`}>{cfg.label}</Badge>;
}

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

const PLAN_LABELS: Record<string, string> = {
  pro: "Pro Mensal",
  pro_annual: "Pro Anual",
};

const METHOD_LABELS: Record<string, string> = {
  pix: "Pix",
  credit_card: "Cartão",
  boleto: "Boleto",
  manual: "Manual",
};

export default function AssinaturasClient({ data }: Props) {
  const { subscriptions, totalProWalkers, totalWalkers } = data;
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>("todos");

  const filtered = filter === "todos" ? subscriptions : subscriptions.filter((s) => s.status === filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalReceived = subscriptions.filter((s) => s.status === "paid").reduce((a, s) => a + s.amount, 0);
  const pendingCount = subscriptions.filter((s) => s.status === "pending").length;
  const failedCount = subscriptions.filter((s) => s.status === "failed").length;

  const hasData = subscriptions.length > 0;

  function handleFilter(f: Filter) { setFilter(f); setPage(1); }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Assinaturas Pro</h1>
        <p className="text-muted-foreground text-sm mt-1">Pagamentos dos walkers à plataforma Zupet Walker pelo plano Pro</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center"><Users className="h-5 w-5 text-violet-600" /></div>
            <div>
              <p className="text-2xl font-heading font-bold">{totalProWalkers}</p>
              <p className="text-xs text-muted-foreground">Walkers Pro</p>
              <p className="text-[10px] text-muted-foreground/70">{totalWalkers > 0 ? Math.round((totalProWalkers / totalWalkers) * 100) : 0}% do total</p>
            </div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-emerald-600" /></div>
            <div>
              <p className="text-lg font-heading font-bold">{fmtBRL(totalReceived)}</p>
              <p className="text-xs text-muted-foreground">Receita total</p>
            </div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><CreditCard className="h-5 w-5 text-amber-600" /></div>
            <div>
              <p className="text-2xl font-heading font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center"><AlertCircle className="h-5 w-5 text-rose-600" /></div>
            <div>
              <p className="text-2xl font-heading font-bold">{failedCount}</p>
              <p className="text-xs text-muted-foreground">Falhas</p>
            </div>
          </div>
        </CardContent></Card>
      </div>

      {/* Aviso se tabela ainda vazia */}
      {!hasData && (
        <Card className="border-dashed">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Tabela de assinaturas ainda sem registros</p>
                <p className="text-xs text-muted-foreground mt-1">
                  A tabela <code className="font-mono bg-muted px-1 rounded">walker_subscriptions</code> foi criada pela migration v51.
                  Registros serão inseridos automaticamente quando o sistema de cobrança for integrado
                  (RevenueCat, Stripe, MercadoPago ou registro manual).
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Atualmente há <strong>{totalProWalkers} walkers Pro</strong> cadastrados via campo <code className="font-mono bg-muted px-1 rounded">walker_profiles.plan</code>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle>Histórico de Assinaturas</CardTitle>
            {hasData && (
              <div className="flex gap-1 flex-wrap">
                {STATUS_FILTERS.map((f) => (
                  <button key={f} onClick={() => handleFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                    {f === "todos" ? "Todos" : STATUS_CONFIG[f as keyof typeof STATUS_CONFIG]?.label ?? f}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardHeader>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-border">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">Nenhuma assinatura encontrada</p>
          ) : paginated.map((s) => (
            <div key={s.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{s.walkerName}</p>
                  <p className="text-xs text-muted-foreground">{s.walkerLocation}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <p className="text-sm font-semibold">{fmtBRL(s.amount)}</p>
                  <StatusBadge status={s.status} />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
                <Badge variant="outline" className="text-[9px]">{PLAN_LABELS[s.plan] ?? s.plan}</Badge>
                <span>{fmtDate(s.periodStart)} → {fmtDate(s.periodEnd)}</span>
                {s.paymentMethod && <span>{METHOD_LABELS[s.paymentMethod] ?? s.paymentMethod}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop */}
        <CardContent className="p-0 hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Walker</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Pago em</TableHead>
                <TableHead className="pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12 text-sm">Nenhuma assinatura encontrada</TableCell></TableRow>
              ) : paginated.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="pl-6">
                    <p className="text-sm font-medium">{s.walkerName}</p>
                    <p className="text-xs text-muted-foreground">{s.walkerLocation}</p>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{PLAN_LABELS[s.plan] ?? s.plan}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{fmtDate(s.periodStart)} → {fmtDate(s.periodEnd)}</TableCell>
                  <TableCell className="text-sm font-semibold tabular-nums">{fmtBRL(s.amount)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.paymentMethod ? (METHOD_LABELS[s.paymentMethod] ?? s.paymentMethod) : "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{fmtDate(s.paidAt)}</TableCell>
                  <TableCell className="pr-6"><StatusBadge status={s.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length.toLocaleString("pt-BR")}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="h-8 w-8 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "...")[]>((acc, p, i, arr) => { if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("..."); acc.push(p); return acc; }, [])
                .map((p, i) => p === "..." ? (
                  <span key={`e-${i}`} className="h-8 w-8 flex items-center justify-center text-xs text-muted-foreground">…</span>
                ) : (
                  <button key={p} onClick={() => setPage(p as number)}
                    className={`h-8 w-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors ${page === p ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                    {p}
                  </button>
                ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="h-8 w-8 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
