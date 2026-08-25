"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Bug, Smartphone } from "lucide-react";

type AppError = {
  id: string;
  userEmail: string;
  errorType: string;
  errorCode: string | null;
  message: string;
  screen: string | null;
  action: string | null;
  appVersion: string | null;
  platform: string | null;
  resolved: boolean;
  resolvedAt: string | null;
  notes: string | null;
  createdAt: string;
};

const TYPE_FILTERS = ["todos", "pendentes", "resolvidos"] as const;
type Filter = typeof TYPE_FILTERS[number];

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

function ErrorRow({ error, onResolved }: { error: AppError; onResolved: (id: string) => void }) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");
  const [expanded, setExpanded] = useState(false);

  async function handleResolve() {
    startTransition(async () => {
      await fetch("/api/walker/erros/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: error.id, notes: notes || null }),
      });
      onResolved(error.id);
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
          {error.appVersion && <Badge variant="outline" className="text-[10px]">{error.appVersion}</Badge>}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[11px] text-muted-foreground">{new Date(error.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
          {error.resolved ? (
            <Badge className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10">
              <CheckCircle2 className="h-3 w-3 mr-1" />Resolvido
            </Badge>
          ) : (
            <button onClick={() => setExpanded((v) => !v)}
              className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              {expanded ? "Fechar" : "Resolver"}
            </button>
          )}
        </div>
      </div>

      <p className="text-sm font-medium leading-snug">{error.message}</p>

      <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
        <span>{error.userEmail}</span>
        {error.screen && <span>tela: <span className="font-mono">{error.screen}</span></span>}
        {error.action && <span>ação: <span className="font-mono">{error.action}</span></span>}
      </div>

      {error.resolved && error.notes && (
        <p className="text-xs text-muted-foreground italic border-t border-border pt-2 mt-1">Nota: {error.notes}</p>
      )}

      {expanded && !error.resolved && (
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

export default function ErrosClient({ errors: initialErrors }: { errors: AppError[] }) {
  const router = useRouter();
  const [errors, setErrors] = useState(initialErrors);
  const [filter, setFilter] = useState<Filter>("pendentes");

  const pending = errors.filter((e) => !e.resolved);
  const resolved = errors.filter((e) => e.resolved);
  const filtered = filter === "todos" ? errors : filter === "pendentes" ? pending : resolved;

  function handleResolved(id: string) {
    setErrors((prev) => prev.map((e) => e.id === id ? { ...e, resolved: true, resolvedAt: new Date().toISOString() } : e));
    router.refresh();
  }

  const crashCount = pending.filter((e) => e.errorType === "crash").length;
  const syncCount = pending.filter((e) => e.errorType === "sync_error").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Erros do App</h1>
        <p className="text-muted-foreground text-sm mt-1">Erros capturados no app Zupet Walker</p>
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
            <div><p className="text-2xl font-heading font-bold">{crashCount}</p><p className="text-xs text-muted-foreground">Crashes</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-amber-600" /></div>
            <div><p className="text-2xl font-heading font-bold">{syncCount}</p><p className="text-xs text-muted-foreground">Sync errors</p></div>
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
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle>Log de Erros</CardTitle>
            <div className="flex gap-1">
              {TYPE_FILTERS.map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  {f === "todos" ? "Todos" : f === "pendentes" ? `Pendentes (${pending.length})` : `Resolvidos (${resolved.length})`}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">Nenhum erro encontrado</p>
          ) : filtered.map((e) => (
            <ErrorRow key={e.id} error={e} onResolved={handleResolved} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
