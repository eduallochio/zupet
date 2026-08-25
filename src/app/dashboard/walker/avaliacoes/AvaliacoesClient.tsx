"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const PAGE_SIZE = 20;

type Rating = {
  id: string;
  walkerName: string;
  ownerEmail: string;
  rating: number;
  comment: string | null;
  sessionId: string | null;
  createdAt: string;
};

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`h-3.5 w-3.5 ${n <= value ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}`} />
      ))}
      <span className="ml-1 text-sm font-medium">{value.toFixed(1)}</span>
    </div>
  );
}

export default function AvaliacoesClient({ ratings }: { ratings: Rating[] }) {
  const [page, setPage] = useState(1);
  const [minRating, setMinRating] = useState(0);

  const filtered = minRating === 0 ? ratings : ratings.filter((r) => r.rating <= minRating);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const avg = ratings.length > 0
    ? (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(1)
    : "—";
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, count: ratings.filter((r) => Math.floor(r.rating) === n).length }));

  function handleFilter(n: number) {
    setMinRating(minRating === n ? 0 : n);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Avaliações</h1>
        <p className="text-muted-foreground text-sm mt-1">Avaliações de tutores sobre os walkers após os passeios</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><Star className="h-5 w-5 text-amber-500" /></div>
            <div><p className="text-3xl font-heading font-bold">{avg}</p><p className="text-xs text-muted-foreground">Média geral</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Star className="h-5 w-5 text-primary" /></div>
            <div><p className="text-3xl font-heading font-bold">{ratings.length}</p><p className="text-xs text-muted-foreground">Total de avaliações</p></div>
          </div>
        </CardContent></Card>
        {/* Distribuição rápida */}
        <Card><CardContent className="pt-5">
          <p className="text-xs font-medium text-muted-foreground mb-2">Distribuição</p>
          <div className="space-y-1">
            {dist.map(({ n, count }) => (
              <div key={n} className="flex items-center gap-2">
                <span className="text-xs w-3">{n}</span>
                <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />
                <div className="flex-1 bg-secondary rounded-full h-1.5">
                  <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: ratings.length ? `${(count / ratings.length) * 100}%` : "0%" }} />
                </div>
                <span className="text-xs text-muted-foreground w-5 text-right">{count}</span>
              </div>
            ))}
          </div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle>Todas as Avaliações</CardTitle>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Filtrar ≤</span>
              {[1, 2, 3].map((n) => (
                <button key={n} onClick={() => handleFilter(n)}
                  className={`h-7 px-2.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${minRating === n ? "bg-amber-500 text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  {n}<Star className="h-3 w-3" />
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-border">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">Nenhuma avaliação encontrada</p>
          ) : paginated.map((r) => (
            <div key={r.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{r.walkerName}</p>
                  <p className="text-xs text-muted-foreground">{r.ownerEmail}</p>
                </div>
                <Stars value={r.rating} />
              </div>
              {r.comment && <p className="text-xs text-muted-foreground mt-1.5 italic">"{r.comment}"</p>}
              <p className="text-[11px] text-muted-foreground mt-1">{new Date(r.createdAt).toLocaleDateString("pt-BR")}</p>
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
                <TableHead>Nota</TableHead>
                <TableHead>Comentário</TableHead>
                <TableHead className="pr-6">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-12 text-sm">Nenhuma avaliação encontrada</TableCell></TableRow>
              ) : paginated.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="pl-6 font-medium text-sm">{r.walkerName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.ownerEmail}</TableCell>
                  <TableCell><Stars value={r.rating} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">
                    {r.comment ? <span className="italic">"{r.comment}"</span> : <span className="text-muted-foreground/50">—</span>}
                  </TableCell>
                  <TableCell className="pr-6 text-sm text-muted-foreground">{new Date(r.createdAt).toLocaleDateString("pt-BR")}</TableCell>
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
