"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Banknote, TrendingUp, Clock, XCircle } from "lucide-react";

const PAGE_SIZE = 20;

const MONTHS_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

type Payment = {
  id: string;
  walkerName: string;
  ownerName: string;
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

const SERVICE_TYPE_LABELS: Record<string, string> = {
  walk:     "Passeio",
  daycare:  "Creche",
  boarding: "Hospedagem",
  grooming: "Banho e tosa",
  training: "Adestramento",
  vet:      "Veterinário",
  other:    "Outro",
};

const STATUS_FILTERS = ["todos", "pending", "paid", "cancelled"] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "2-digit" });
}

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function StatusBadge({ status }: { status: Payment["status"] }) {
  if (status === "paid")    return <Badge className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">Pago</Badge>;
  if (status === "pending") return <Badge className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/10">Pendente</Badge>;
  return <Badge className="text-xs bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/10">Cancelado</Badge>;
}

export default function PagamentosClient({ payments }: { payments: Payment[] }) {
  const now = new Date();
  const [viewYear, setViewYear]   = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [page, setPage] = useState(1);

  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const prevMonth = () => {
    setPage(1);
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (isCurrentMonth) return;
    setPage(1);
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  // Filtra pelo mês selecionado
  const monthStart = new Date(viewYear, viewMonth, 1).toISOString();
  const monthEnd   = new Date(viewYear, viewMonth + 1, 0, 23, 59, 59, 999).toISOString();
  const monthPayments = payments.filter((p) => p.createdAt >= monthStart && p.createdAt <= monthEnd);

  const filtered = statusFilter === "todos" ? monthPayments : monthPayments.filter((p) => p.status === statusFilter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalPaid      = monthPayments.filter((p) => p.status === "paid").reduce((a, p) => a + p.amount, 0);
  const totalPending   = monthPayments.filter((p) => p.status === "pending").reduce((a, p) => a + p.amount, 0);
  const totalCancelled = monthPayments.filter((p) => p.status === "cancelled").length;

  function handleFilter(f: StatusFilter) { setStatusFilter(f); setPage(1); }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Recebimentos</h1>
          <p className="text-muted-foreground text-sm mt-1">Pagamentos de tutores aos walkers pelo serviço prestado</p>
        </div>
        {/* Seletor de mês */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card px-1 py-1">
          <button onClick={prevMonth} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 text-sm font-semibold min-w-[110px] text-center">
            {MONTHS_PT[viewMonth]} {viewYear}
          </span>
          <button onClick={nextMonth} disabled={isCurrentMonth}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Banknote className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-heading font-bold">{monthPayments.length}</p><p className="text-xs text-muted-foreground">Total no mês</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-emerald-500" /></div>
            <div><p className="text-lg font-heading font-bold">{fmtBRL(totalPaid)}</p><p className="text-xs text-muted-foreground">Recebido</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><Clock className="h-5 w-5 text-amber-500" /></div>
            <div><p className="text-lg font-heading font-bold">{fmtBRL(totalPending)}</p><p className="text-xs text-muted-foreground">Pendente</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center"><XCircle className="h-5 w-5 text-rose-500" /></div>
            <div><p className="text-2xl font-heading font-bold">{totalCancelled}</p><p className="text-xs text-muted-foreground">Cancelados</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle>Histórico de pagamentos</CardTitle>
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
            <p className="text-center text-muted-foreground py-12 text-sm">Nenhum pagamento em {MONTHS_PT[viewMonth]} {viewYear}</p>
          ) : paginated.map((p) => (
            <div key={p.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{p.walkerName}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.ownerName}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <p className="text-sm font-semibold">{fmtBRL(p.amount)}</p>
                  <StatusBadge status={p.status} />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
                <span>{BILLING_LABELS[p.billingType] ?? p.billingType}</span>
                {p.serviceType && <span>{SERVICE_TYPE_LABELS[p.serviceType] ?? p.serviceType}</span>}
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
                <TableHead className="pl-6">Data</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Tipo / Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-12 text-sm">Nenhum pagamento em {MONTHS_PT[viewMonth]} {viewYear}</TableCell></TableRow>
              ) : paginated.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="pl-6 text-sm text-muted-foreground">{fmtDate(p.createdAt)}</TableCell>
                  <TableCell className="text-sm font-medium">{p.ownerName}</TableCell>
                  <TableCell className="text-sm">
                    <div className="flex flex-col gap-0.5">
                      {p.serviceType && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <span>🎯</span>{SERVICE_TYPE_LABELS[p.serviceType] ?? p.serviceType}
                        </span>
                      )}
                      {p.description && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <span>{p.billingType === "per_session" ? "💵" : "📅"}</span>{p.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-semibold tabular-nums text-foreground">{fmtBRL(p.amount)}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell className="pr-6 text-sm text-muted-foreground">—</TableCell>
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
