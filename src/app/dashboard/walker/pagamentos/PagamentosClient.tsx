"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Banknote, TrendingUp, Clock, XCircle } from "lucide-react";

const PAGE_SIZE = 20;

type Payment = {
  id: string;
  walkerName: string;
  ownerEmail: string;
  amount: number;
  billingType: string;
  periodRef: string | null;
  status: "pending" | "paid" | "cancelled";
  paidAt: string | null;
  serviceType: string | null;
  description: string | null;
  notes: string | null;
  createdAt: string;
};

const BILLING_LABELS: Record<string, string> = {
  per_session: "Por sessão",
  daily: "Diário",
  weekly: "Semanal",
  biweekly: "Quinzenal",
  monthly: "Mensal",
};

const STATUS_FILTERS = ["todos", "pending", "paid", "cancelled"] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function StatusBadge({ status }: { status: Payment["status"] }) {
  if (status === "paid") return <Badge className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10">Pago</Badge>;
  if (status === "pending") return <Badge className="text-xs bg-amber-500/10 text-amber-700 border-amber-500/30 hover:bg-amber-500/10">Pendente</Badge>;
  return <Badge className="text-xs bg-rose-500/10 text-rose-700 border-rose-500/30 hover:bg-rose-500/10">Cancelado</Badge>;
}

export default function PagamentosClient({ payments }: { payments: Payment[] }) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");

  const filtered = statusFilter === "todos" ? payments : payments.filter((p) => p.status === statusFilter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalPaid = payments.filter((p) => p.status === "paid").reduce((a, p) => a + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "pending").reduce((a, p) => a + p.amount, 0);
  const totalCancelled = payments.filter((p) => p.status === "cancelled").length;

  function handleFilter(f: StatusFilter) {
    setStatusFilter(f);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Recebimentos</h1>
        <p className="text-muted-foreground text-sm mt-1">Pagamentos de tutores aos walkers pelo serviço prestado</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Banknote className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-heading font-bold">{payments.length}</p><p className="text-xs text-muted-foreground">Total</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-emerald-600" /></div>
            <div><p className="text-lg font-heading font-bold">{fmtBRL(totalPaid)}</p><p className="text-xs text-muted-foreground">Recebido</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><Clock className="h-5 w-5 text-amber-600" /></div>
            <div><p className="text-lg font-heading font-bold">{fmtBRL(totalPending)}</p><p className="text-xs text-muted-foreground">Pendente</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center"><XCircle className="h-5 w-5 text-rose-600" /></div>
            <div><p className="text-2xl font-heading font-bold">{totalCancelled}</p><p className="text-xs text-muted-foreground">Cancelados</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle>Todos os Pagamentos</CardTitle>
            <div className="flex gap-1">
              {STATUS_FILTERS.map((f) => (
                <button key={f} onClick={() => handleFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${statusFilter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  {f === "todos" ? "Todos" : f === "paid" ? "Pagos" : f === "pending" ? "Pendentes" : "Cancelados"}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-border">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">Nenhum pagamento encontrado</p>
          ) : paginated.map((p) => (
            <div key={p.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{p.walkerName}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.ownerEmail}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <p className="text-sm font-semibold">{fmtBRL(p.amount)}</p>
                  <StatusBadge status={p.status} />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
                <span>{BILLING_LABELS[p.billingType] ?? p.billingType}</span>
                {p.serviceType && <span>{p.serviceType}</span>}
                {p.periodRef && <span>{p.periodRef}</span>}
                <span>{fmtDate(p.createdAt)}</span>
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
                <TableHead>Tutor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cobrança</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-12 text-sm">Nenhum pagamento encontrado</TableCell></TableRow>
              ) : paginated.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="pl-6 font-medium text-sm">{p.walkerName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.ownerEmail}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.serviceType ?? "—"}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{BILLING_LABELS[p.billingType] ?? p.billingType}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.periodRef ?? "—"}</TableCell>
                  <TableCell className="text-sm font-semibold tabular-nums">{fmtBRL(p.amount)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{fmtDate(p.createdAt)}</TableCell>
                  <TableCell className="pr-6"><StatusBadge status={p.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length.toLocaleString("pt-BR")}
            </p>
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
