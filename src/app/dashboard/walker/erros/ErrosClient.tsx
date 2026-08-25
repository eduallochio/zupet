"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, CheckCircle2, Clock, Layers } from "lucide-react";

type ErrorRow = {
  id: string;
  error_type: string | null;
  error_code: string | null;
  message: string | null;
  action: string | null;
  screen: string | null;
  app_version: string | null;
  platform: string | null;
  metadata: Record<string, unknown> | null;
  resolved: boolean | null;
  resolved_at: string | null;
  notes: string | null;
  created_at: string;
};

type ErrosData = {
  totalErrors: number;
  unresolvedErrors: number;
  resolvedErrors: number;
  last24hCount: number;
  byType: Record<string, number>;
  recentErrors: ErrorRow[];
};

function KpiCard({
  icon: Icon,
  iconBg,
  iconColor,
  value,
  label,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  value: string | number;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}
          >
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-heading font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorTypeBadge({ type }: { type: string | null }) {
  const t = type ?? "unknown";
  if (t === "crash") {
    return (
      <Badge className="bg-rose-500/10 text-rose-700 border-rose-500/30 hover:bg-rose-500/10 text-xs">
        {t}
      </Badge>
    );
  }
  if (t === "sync_error") {
    return (
      <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/30 hover:bg-amber-500/10 text-xs">
        {t}
      </Badge>
    );
  }
  if (t === "api_error") {
    return (
      <Badge className="bg-orange-500/10 text-orange-700 border-orange-500/30 hover:bg-orange-500/10 text-xs">
        {t}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs text-muted-foreground">
      {t}
    </Badge>
  );
}

export default function ErrosClient({ data }: { data: ErrosData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Erros</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitoramento de erros registrados pelos apps Zupet
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          icon={Layers}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          value={data.totalErrors.toLocaleString("pt-BR")}
          label="Total de erros"
        />
        <KpiCard
          icon={AlertTriangle}
          iconBg="bg-rose-500/10"
          iconColor="text-rose-600"
          value={data.unresolvedErrors.toLocaleString("pt-BR")}
          label="Não resolvidos"
        />
        <KpiCard
          icon={CheckCircle2}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-600"
          value={data.resolvedErrors.toLocaleString("pt-BR")}
          label="Resolvidos"
        />
        <KpiCard
          icon={Clock}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-600"
          value={data.last24hCount.toLocaleString("pt-BR")}
          label="Últimas 24h"
        />
      </div>

      {/* Distribuição por tipo */}
      {Object.keys(data.byType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Por Tipo de Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(data.byType)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div key={type} className="flex items-center gap-2">
                    <ErrorTypeBadge type={type} />
                    <span className="text-sm font-medium text-foreground">
                      {count.toLocaleString("pt-BR")}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de erros recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Erros Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Tipo</TableHead>
                <TableHead>Mensagem</TableHead>
                <TableHead>Tela / Ação</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentErrors.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-12 text-sm"
                  >
                    Nenhum erro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                data.recentErrors.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="pl-6">
                      <ErrorTypeBadge type={e.error_type} />
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm truncate" title={e.message ?? ""}>
                        {e.message ?? "—"}
                      </p>
                      {e.error_code && (
                        <p className="text-xs text-muted-foreground">
                          {e.error_code}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{e.screen ?? "—"}</p>
                      {e.action && (
                        <p className="text-xs text-muted-foreground">
                          {e.action}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {e.app_version ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground capitalize">
                      {e.platform ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(e.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="pr-6">
                      {e.resolved ? (
                        <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10 text-xs">
                          Resolvido
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-500/10 text-rose-700 border-rose-500/30 hover:bg-rose-500/10 text-xs">
                          Aberto
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
