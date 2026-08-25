"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Wrench, CheckCircle2, XCircle } from "lucide-react";

const PAGE_SIZE = 20;

type Service = {
  id: string;
  walkerName: string;
  walkerLocation: string;
  type: string;
  label: string | null;
  description: string | null;
  price: number;
  priceDaily: number | null;
  priceWeekly: number | null;
  priceBiweekly: number | null;
  priceMonthly: number | null;
  billingType: string;
  durationMinutes: number | null;
  maxPets: number | null;
  active: boolean;
  createdAt: string;
};

const TYPE_LABELS: Record<string, string> = {
  dog_walking: "Passeio",
  dog_sitting: "Hospedagem",
  dog_training: "Adestramento",
  pet_taxi: "Pet Taxi",
};

function fmtBRL(v: number | null) {
  if (!v) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ServicosClient({ services }: { services: Service[] }) {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"todos" | "ativo" | "inativo">("todos");

  const filtered = filter === "todos" ? services : services.filter((s) => filter === "ativo" ? s.active : !s.active);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCount = services.filter((s) => s.active).length;

  function handleFilter(f: typeof filter) { setFilter(f); setPage(1); }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Serviços</h1>
        <p className="text-muted-foreground text-sm mt-1">Serviços cadastrados pelos walkers</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Wrench className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-heading font-bold">{services.length}</p><p className="text-xs text-muted-foreground">Total</p></div>
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
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center"><XCircle className="h-5 w-5 text-rose-600" /></div>
            <div><p className="text-2xl font-heading font-bold">{services.length - activeCount}</p><p className="text-xs text-muted-foreground">Inativos</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle>Todos os Serviços</CardTitle>
            <div className="flex gap-1">
              {(["todos", "ativo", "inativo"] as const).map((f) => (
                <button key={f} onClick={() => handleFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  {f === "todos" ? "Todos" : f === "ativo" ? "Ativos" : "Inativos"}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-border">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">Nenhum serviço encontrado</p>
          ) : paginated.map((s) => (
            <div key={s.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{s.walkerName}</p>
                  <p className="text-xs text-muted-foreground">{s.walkerLocation}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {s.active ? (
                    <Badge className="text-[10px] bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10">Ativo</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">Inativo</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge variant="outline" className="text-[10px]">{TYPE_LABELS[s.type] ?? s.type}</Badge>
                {s.label && <span className="text-xs text-muted-foreground">{s.label}</span>}
              </div>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground flex-wrap">
                <span>{fmtBRL(s.price)} /sessão</span>
                {s.priceMonthly && <span>{fmtBRL(s.priceMonthly)} /mês</span>}
                {s.durationMinutes && <span>{s.durationMinutes}min</span>}
                {s.maxPets && <span>máx {s.maxPets} pets</span>}
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
                <TableHead>Tipo</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Por sessão</TableHead>
                <TableHead>Mensal</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Max pets</TableHead>
                <TableHead className="pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-12 text-sm">Nenhum serviço encontrado</TableCell></TableRow>
              ) : paginated.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="pl-6">
                    <p className="text-sm font-medium">{s.walkerName}</p>
                    <p className="text-xs text-muted-foreground">{s.walkerLocation}</p>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{TYPE_LABELS[s.type] ?? s.type}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.label ?? "—"}</TableCell>
                  <TableCell className="text-sm tabular-nums">{fmtBRL(s.price)}</TableCell>
                  <TableCell className="text-sm tabular-nums">{fmtBRL(s.priceMonthly)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.durationMinutes ? `${s.durationMinutes}min` : "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.maxPets ?? "—"}</TableCell>
                  <TableCell className="pr-6">
                    {s.active ? (
                      <Badge className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10">Ativo</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">Inativo</Badge>
                    )}
                  </TableCell>
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
