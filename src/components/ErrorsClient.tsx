"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FilterTabs from "@/components/FilterTabs";
import Pagination, { PAGE_SIZE } from "@/components/Pagination";
import { AlertTriangle, CheckCircle2, Bug, Smartphone } from "lucide-react";

export type AppError = {
  id: string;
  userEmail: string;
  errorType: string;
  errorCode: string | null;
  message: string;
  stackTrace: string | null;
  screen: string | null;
  action: string | null;
  appVersion: string | null;
  platform: string | null;
  osVersion: string | null;
  resolved: boolean;
  resolvedAt: string | null;
  notes: string | null;
  createdAt: string;
};

type StatusFilter = "pending" | "resolved" | "all";

const TYPE_COLORS: Record<string, string> = {
  crash: "bg-rose-500/10 text-rose-700 border-rose-500/30",
  sync_error: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  api_error: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  validation: "bg-violet-500/10 text-violet-700 border-violet-500/30",
};

function TypeBadge({ type }: { type: string }) {
  const cls = TYPE_COLORS[type] ?? "bg-secondary text-muted-foreground";
  return <Badge className={`text-[10px] hover:${cls} ${cls}`}>{type}</Badge>;
}

function ErrorRow({ error, repeats, onResolved }: { error: AppError; repeats: number; onResolved: (id: string) => void }) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");
  const [resolving, setResolving] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  async function handleResolve() {
    startTransition(async () => {
      const res = await fetch("/api/walker/erros/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: error.id, notes: notes || null }),
      });
      if (res.ok) onResolved(error.id);
    });
  }

  return (
    <div className={`border rounded-lg p-4 space-y-2 ${error.resolved ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <TypeBadge type={error.errorType} />
          {error.errorCode && <Badge variant="outline" className="text-[10px] font-mono">{error.errorCode}</Badge>}
          {error.platform && (
            <Badge variant="outline" className="text-[10px]">
              <Smartphone className="h-3 w-3 mr-0.5" />{error.platform}
            </Badge>
          )}
          {error.appVersion && <Badge variant="outline" className="text-[10px]">v{error.appVersion}</Badge>}
          {repeats > 1 && (
            <Badge variant="outline" className="text-[10px] border-rose-500/30 text-rose-700" title="Mesma mensagem registrada várias vezes">
              ×{repeats}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[11px] text-muted-foreground">
            {new Date(error.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
          </span>
          {error.stackTrace && (
            <button onClick={() => setShowDetails((v) => !v)}
              className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              {showDetails ? "Ocultar detalhes" : "Detalhes"}
            </button>
          )}
          {error.resolved ? (
            <Badge className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10">
              <CheckCircle2 className="h-3 w-3 mr-1" />Resolvido
            </Badge>
          ) : (
            <button onClick={() => setResolving((v) => !v)}
              className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              {resolving ? "Fechar" : "Resolver"}
            </button>
          )}
        </div>
      </div>

      <p className="text-sm font-medium leading-snug break-words">{error.message}</p>

      <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
        <span>{error.userEmail}</span>
        {error.screen && <span>tela: <span className="font-mono">{error.screen}</span></span>}
        {error.action && <span>ação: <span className="font-mono">{error.action}</span></span>}
        {error.osVersion && <span>SO: <span className="font-mono">{error.osVersion}</span></span>}
      </div>

      {showDetails && error.stackTrace && (
        <pre className="text-[11px] leading-snug font-mono bg-secondary/60 rounded-md p-3 overflow-x-auto max-h-64 whitespace-pre-wrap break-words">
          {error.stackTrace}
        </pre>
      )}

      {error.resolved && error.notes && (
        <p className="text-xs text-muted-foreground italic border-t border-border pt-2 mt-1">Nota: {error.notes}</p>
      )}

      {resolving && !error.resolved && (
        <div className="border-t border-border pt-3 mt-1 space-y-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Nota sobre a resolução (opcional)…"
            rows={2}
            className="w-full text-xs px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <button onClick={handleResolve} disabled={isPending}
            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">
            {isPending ? "Salvando…" : "Marcar como resolvido"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ErrorsClient({
  errors: initialErrors,
  title,
  subtitle,
}: {
  errors: AppError[];
  title: string;
  subtitle: string;
}) {
  const router = useRouter();
  const [errors, setErrors] = useState(initialErrors);
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [type, setType] = useState<string>("all");
  const [page, setPage] = useState(1);

  const pending = errors.filter((e) => !e.resolved);
  const resolved = errors.filter((e) => e.resolved);
  const crashCount = pending.filter((e) => e.errorType === "crash").length;
  const syncCount = pending.filter((e) => e.errorType === "sync_error").length;

  const byStatus = status === "all" ? errors : status === "pending" ? pending : resolved;
  const filtered = byStatus.filter((e) => type === "all" || e.errorType === type);
  const pageErrors = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Quantas vezes a mesma mensagem apareceu (entre os pendentes), para separar ruído de problema recorrente
  const repeatsByMessage: Record<string, number> = {};
  for (const e of pending) repeatsByMessage[e.message] = (repeatsByMessage[e.message] ?? 0) + 1;

  const statusOptions: { key: StatusFilter; label: string; count: number }[] = [
    { key: "pending", label: "Pendentes", count: pending.length },
    { key: "resolved", label: "Resolvidos", count: resolved.length },
    { key: "all", label: "Todos", count: errors.length },
  ];
  const types = Array.from(new Set(byStatus.map((e) => e.errorType))).sort();
  const typeOptions = [
    { key: "all", label: "Todos os tipos", count: byStatus.length },
    ...types.map((t) => ({ key: t, label: t, count: byStatus.filter((e) => e.errorType === t).length })),
  ];

  function handleResolved(id: string) {
    setErrors((prev) => prev.map((e) => (e.id === id ? { ...e, resolved: true, resolvedAt: new Date().toISOString() } : e)));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-rose-600" /></div>
            <div><p className="text-2xl font-heading font-bold">{pending.length}</p><p className="text-xs text-muted-foreground">Pendentes</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center"><Bug className="h-5 w-5 text-rose-600" /></div>
            <div><p className="text-2xl font-heading font-bold">{crashCount}</p><p className="text-xs text-muted-foreground">Crashes pendentes</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-amber-600" /></div>
            <div><p className="text-2xl font-heading font-bold">{syncCount}</p><p className="text-xs text-muted-foreground">Erros de sincronização</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
            <div><p className="text-2xl font-heading font-bold">{resolved.length}</p><p className="text-xs text-muted-foreground">Resolvidos</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0">
          <CardTitle>Log de Erros</CardTitle>
          <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-6">
            <FilterTabs options={statusOptions} value={status} onChange={(s) => { setStatus(s); setType("all"); setPage(1); }} label="Filtrar por status" />
            <FilterTabs options={typeOptions} value={type} onChange={(t) => { setType(t); setPage(1); }} label="Filtrar por tipo" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">Nenhum erro encontrado</p>
          ) : pageErrors.map((e) => (
            <ErrorRow key={e.id} error={e} repeats={e.resolved ? 1 : repeatsByMessage[e.message] ?? 1} onResolved={handleResolved} />
          ))}
        </CardContent>
        <Pagination page={page} total={filtered.length} onPageChange={setPage} />
      </Card>
    </div>
  );
}
