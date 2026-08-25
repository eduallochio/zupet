"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Footprints, MapPin, Timer, PawPrint } from "lucide-react";

const PAGE_SIZE = 20;

type Session = {
  id: string;
  walkerName: string;
  ownerEmail: string;
  startedAt: string | null;
  endedAt: string | null;
  durationMinutes: number | null;
  distanceMeters: number | null;
  petCount: number;
  notes: string | null;
  createdAt: string;
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function fmtDur(min: number | null) {
  if (!min) return "—";
  if (min < 60) return `${min}min`;
  return `${Math.floor(min / 60)}h${min % 60 > 0 ? ` ${min % 60}min` : ""}`;
}

function fmtKm(m: number | null) {
  if (!m) return "—";
  return `${(m / 1000).toFixed(1)} km`;
}

export default function PasseiosClient({ sessions }: { sessions: Session[] }) {
  const [page, setPage] = useState(1);
  const concluded = sessions.filter((s) => s.endedAt !== null);
  const totalPages = Math.max(1, Math.ceil(sessions.length / PAGE_SIZE));
  const paginated = sessions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalKm = concluded.reduce((a, s) => a + (s.distanceMeters ?? 0), 0) / 1000;
  const totalMin = concluded.reduce((a, s) => a + (s.durationMinutes ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Passeios</h1>
        <p className="text-muted-foreground text-sm mt-1">Histórico de walk_sessions do Zupet Walker</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Footprints className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-heading font-bold">{sessions.length}</p><p className="text-xs text-muted-foreground">Total</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Footprints className="h-5 w-5 text-emerald-600" /></div>
            <div><p className="text-2xl font-heading font-bold">{concluded.length}</p><p className="text-xs text-muted-foreground">Concluídos</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><MapPin className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-2xl font-heading font-bold">{totalKm.toFixed(1)}</p><p className="text-xs text-muted-foreground">Km percorridos</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><Timer className="h-5 w-5 text-amber-600" /></div>
            <div><p className="text-2xl font-heading font-bold">{(totalMin / 60).toFixed(0)}h</p><p className="text-xs text-muted-foreground">Horas totais</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Todos os Passeios</CardTitle></CardHeader>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-border">
          {paginated.map((s) => (
            <div key={s.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{s.walkerName}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.ownerEmail}</p>
                </div>
                {s.endedAt ? (
                  <Badge className="text-[10px] bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10 shrink-0">Concluído</Badge>
                ) : (
                  <Badge className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/30 hover:bg-amber-500/10 shrink-0">Em andamento</Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
                <span>{fmtDate(s.startedAt)}</span>
                {s.durationMinutes && <span className="flex items-center gap-0.5"><Timer className="h-3 w-3" />{fmtDur(s.durationMinutes)}</span>}
                {s.distanceMeters && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{fmtKm(s.distanceMeters)}</span>}
                {s.petCount > 0 && <span className="flex items-center gap-0.5"><PawPrint className="h-3 w-3" />{s.petCount}</span>}
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
                <TableHead>Início</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Distância</TableHead>
                <TableHead>Pets</TableHead>
                <TableHead className="pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12 text-sm">Nenhum passeio encontrado</TableCell></TableRow>
              ) : paginated.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="pl-6 font-medium text-sm">{s.walkerName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.ownerEmail}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{fmtDate(s.startedAt)}</TableCell>
                  <TableCell className="text-sm">{fmtDur(s.durationMinutes)}</TableCell>
                  <TableCell className="text-sm">{fmtKm(s.distanceMeters)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{s.petCount}</Badge>
                  </TableCell>
                  <TableCell className="pr-6">
                    {s.endedAt ? (
                      <Badge className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10">Concluído</Badge>
                    ) : (
                      <Badge className="text-xs bg-amber-500/10 text-amber-700 border-amber-500/30 hover:bg-amber-500/10">Em andamento</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sessions.length)} de {sessions.length.toLocaleString("pt-BR")}
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
