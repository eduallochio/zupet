"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Users, Calendar, Star, Zap, ChevronLeft, ChevronRight, Crown, X } from "lucide-react";

const PAGE_SIZE = 20;

type Walker = {
  id: string;
  name: string;
  email: string;
  location: string;
  plan: "free" | "pro";
  rating: number | null;
  services: number;
  active: boolean;
  createdAt: string;
  hasZupet: boolean;
};

function PlanModal({
  walker,
  onClose,
  onConfirm,
}: {
  walker: Walker;
  onClose: () => void;
  onConfirm: (walkerId: string, plan: "free" | "pro", note: string) => void;
}) {
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const targetPlan = walker.plan === "pro" ? "free" : "pro";

  function handleConfirm() {
    startTransition(async () => {
      await onConfirm(walker.id, targetPlan, note);
      onClose();
    });
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="font-heading text-lg font-bold">
              {targetPlan === "pro" ? "Promover para Pro" : "Revogar plano Pro"}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Walker: <span className="font-medium text-foreground">{walker.name}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {targetPlan === "pro" && (
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg px-4 py-3 mb-4 text-sm text-violet-700 dark:text-violet-400">
            Isso vai definir <strong>plan = &apos;pro&apos;</strong> no perfil do walker e registrar uma assinatura manual em <strong>walker_subscriptions</strong>.
          </div>
        )}
        {targetPlan === "free" && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 mb-4 text-sm text-amber-700 dark:text-amber-400">
            Isso vai reverter o walker para <strong>plan = &apos;free&apos;</strong>. O acesso Pro será removido imediatamente.
          </div>
        )}

        <div className="mb-4">
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">MOTIVO / NOTA INTERNA</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={targetPlan === "pro" ? "Ex: beta tester, teste de campanha, parceiro..." : "Ex: período de teste encerrado..."}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
              targetPlan === "pro"
                ? "bg-violet-600 text-white hover:bg-violet-700"
                : "bg-destructive text-destructive-foreground hover:opacity-90"
            }`}
          >
            {isPending ? "Salvando…" : targetPlan === "pro" ? "Promover para Pro" : "Revogar Pro"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function PlanButton({ walker, onPlanChange }: { walker: Walker; onPlanChange: (id: string, plan: "free" | "pro") => void }) {
  const [showModal, setShowModal] = useState(false);

  async function handleConfirm(walkerId: string, plan: "free" | "pro", note: string) {
    await fetch("/api/walker/walkers/set-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walkerId, plan, note }),
    });
    onPlanChange(walkerId, plan);
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        title={walker.plan === "pro" ? "Revogar Pro" : "Promover para Pro"}
        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border transition-colors ${
          walker.plan === "pro"
            ? "bg-violet-500/10 text-violet-700 border-violet-500/30 hover:bg-rose-500/10 hover:text-rose-700 hover:border-rose-500/30"
            : "bg-secondary text-muted-foreground border-border hover:bg-violet-500/10 hover:text-violet-700 hover:border-violet-500/30"
        }`}
      >
        <Crown className="h-3 w-3" />
        {walker.plan === "pro" ? "Pro" : "Free"}
      </button>
      {showModal && (
        <PlanModal
          walker={walker}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}

export default function WalkersClient({ walkers: initial }: { walkers: Walker[] }) {
  const [walkers, setWalkers] = useState(initial);
  const [page, setPage] = useState(1);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newWalkers = walkers.filter((w) => new Date(w.createdAt) >= startOfMonth).length;
  const activeWalkers = walkers.filter((w) => w.active).length;
  const proWalkers = walkers.filter((w) => w.plan === "pro").length;
  const totalPages = Math.max(1, Math.ceil(walkers.length / PAGE_SIZE));
  const paginatedWalkers = walkers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handlePlanChange(id: string, plan: "free" | "pro") {
    setWalkers((prev) => prev.map((w) => w.id === id ? { ...w, plan } : w));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Walkers</h1>
        <p className="text-muted-foreground text-sm mt-1">Todos os walkers cadastrados no Zupet</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{walkers.length.toLocaleString("pt-BR")}</p>
                <p className="text-xs text-muted-foreground">Total de walkers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{activeWalkers}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{proWalkers}</p>
                <p className="text-xs text-muted-foreground">Plano Pro</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{newWalkers}</p>
                <p className="text-xs text-muted-foreground">Novos no mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Todos os Walkers</CardTitle>
            <p className="text-xs text-muted-foreground">Clique no badge de plano para promover / revogar Pro</p>
          </div>
        </CardHeader>

        {/* Mobile: cards */}
        <div className="md:hidden divide-y divide-border">
          {walkers.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">Nenhum walker encontrado</p>
          ) : (
            paginatedWalkers.map((walker) => {
              const isNew = new Date(walker.createdAt) >= startOfMonth;
              return (
                <div key={walker.id} className="px-4 py-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                    {walker.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{walker.name}</p>
                      {isNew && (
                        <Badge className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10">
                          novo
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{walker.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {walker.hasZupet && (
                        <Badge className="text-[9px] px-1 py-0 h-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                          Zupet
                        </Badge>
                      )}
                      <Badge className="text-[9px] px-1 py-0 h-4 bg-amber-500/10 text-amber-700 border-amber-500/30 hover:bg-amber-500/10">
                        Walker
                      </Badge>
                      <PlanButton walker={walker} onPlanChange={handlePlanChange} />
                      {walker.active ? (
                        <Badge className="text-[9px] px-1 py-0 h-4 bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 text-muted-foreground">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
                      {walker.location !== "—" && <span>{walker.location}</span>}
                      {walker.rating !== null && (
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          {walker.rating.toFixed(1)}
                        </span>
                      )}
                      <span>{walker.services} serviço{walker.services !== 1 ? "s" : ""}</span>
                      <span>{new Date(walker.createdAt).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop: tabela */}
        <CardContent className="p-0 hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Walker</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Serviços</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6">Cadastro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {walkers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-12 text-sm">
                    Nenhum walker encontrado
                  </TableCell>
                </TableRow>
              ) : (
                paginatedWalkers.map((walker) => {
                  const isNew = new Date(walker.createdAt) >= startOfMonth;
                  return (
                    <TableRow key={walker.id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                            {walker.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{walker.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{walker.id.slice(0, 8)}…</p>
                            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                              {walker.hasZupet && (
                                <Badge className="text-[9px] px-1 py-0 h-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                                  Zupet
                                </Badge>
                              )}
                              <Badge className="text-[9px] px-1 py-0 h-4 bg-amber-500/10 text-amber-700 border-amber-500/30 hover:bg-amber-500/10">
                                Walker
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{walker.email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{walker.location}</TableCell>
                      <TableCell>
                        <PlanButton walker={walker} onPlanChange={handlePlanChange} />
                      </TableCell>
                      <TableCell>
                        {walker.rating !== null ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                            <span className="text-sm">{walker.rating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {walker.services}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {walker.active ? (
                          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10 text-xs">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            Inativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {new Date(walker.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                          {isNew && (
                            <Badge className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10">
                              novo
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, walkers.length)} de {walkers.length.toLocaleString("pt-BR")} walkers
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "...")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="h-8 w-8 flex items-center justify-center text-xs text-muted-foreground">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`h-8 w-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors ${
                        page === p
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 w-8 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
