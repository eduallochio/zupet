"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import FilterTabs from "@/components/FilterTabs";
import Pagination, { PAGE_SIZE } from "@/components/Pagination";
import type { AppUser } from "@/lib/app-users";
import { Bell, BellOff, BellRing, Users } from "lucide-react";

type PlatformFilter = "all" | "android" | "ios" | "unknown";
type PushStatus = "ok" | "no_token" | "disabled";
type StatusFilter = "all" | PushStatus;

/** ok = tem token e não desligou; disabled = desligou nas configurações; no_token = nunca registrou token */
function pushStatus(u: AppUser): PushStatus {
  if (u.pushEnabled === false) return "disabled";
  return u.hasExpoToken || u.hasFcmToken ? "ok" : "no_token";
}

const PLATFORM_LABEL: Record<Exclude<PlatformFilter, "all">, string> = { android: "Android", ios: "iOS", unknown: "Sem plataforma" };

export default function PushClient({ users }: { users: AppUser[] }) {
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const platformOf = (u: AppUser): Exclude<PlatformFilter, "all"> => u.platform ?? "unknown";
  const withStatus = users.map((u) => ({ u, s: pushStatus(u) }));
  const countStatus = (list: typeof withStatus, s: PushStatus) => list.filter((x) => x.s === s).length;

  const inPlatform = withStatus.filter((x) => platform === "all" || platformOf(x.u) === platform);
  const rows = inPlatform
    .filter((x) => status === "all" || x.s === status)
    .sort((a, b) => a.u.name.localeCompare(b.u.name));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const total = users.length;
  const ok = countStatus(withStatus, "ok");
  const noToken = countStatus(withStatus, "no_token");
  const disabled = countStatus(withStatus, "disabled");
  const pct = (n: number, of: number) => (of > 0 ? Math.round((n / of) * 100) : 0);

  const platforms = (["android", "ios", "unknown"] as const).filter((p) => withStatus.some((x) => platformOf(x.u) === p));

  const platformOptions = [
    { key: "all" as const, label: "Todas", count: total },
    ...platforms.map((p) => ({ key: p as PlatformFilter, label: PLATFORM_LABEL[p], count: withStatus.filter((x) => platformOf(x.u) === p).length })),
  ];
  const statusOptions = [
    { key: "all" as const, label: "Todos", count: inPlatform.length },
    { key: "ok" as const, label: "Recebem push", count: countStatus(inPlatform, "ok") },
    { key: "no_token" as const, label: "Sem token", count: countStatus(inPlatform, "no_token") },
    { key: "disabled" as const, label: "Desativaram", count: countStatus(inPlatform, "disabled") },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Notificações Push</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Quem consegue receber notificação: precisa ter um token registrado pelo app e não ter desligado as notificações.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-heading font-bold">{total}</p><p className="text-xs text-muted-foreground">Perfis de usuário</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><BellRing className="h-5 w-5 text-emerald-600" /></div>
            <div><p className="text-2xl font-heading font-bold">{pct(ok, total)}%</p><p className="text-xs text-muted-foreground">Recebem push ({ok})</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center"><BellOff className="h-5 w-5 text-rose-600" /></div>
            <div><p className="text-2xl font-heading font-bold">{noToken}</p><p className="text-xs text-muted-foreground">Sem token registrado</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><Bell className="h-5 w-5 text-amber-600" /></div>
            <div><p className="text-2xl font-heading font-bold">{disabled}</p><p className="text-xs text-muted-foreground">Desativaram</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cobertura por plataforma</CardTitle>
          <CardDescription>Clique numa plataforma para filtrar a tabela. Clique de novo para limpar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {platforms.map((p) => {
            const list = withStatus.filter((x) => platformOf(x.u) === p);
            const n = countStatus(list, "ok");
            const value = pct(n, list.length);
            const selected = platform === p;
            return (
              <button
                key={p}
                type="button"
                aria-pressed={selected}
                onClick={() => { setPlatform(selected ? "all" : p); setStatus("all"); setPage(1); }}
                className={`flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-secondary/60 ${selected ? "bg-secondary" : ""}`}
                style={{ opacity: platform !== "all" && !selected ? 0.4 : 1 }}
              >
                <span className="w-28 shrink-0 text-sm font-medium">{PLATFORM_LABEL[p]}</span>
                <span className="h-2.5 flex-1 rounded-full bg-secondary overflow-hidden">
                  <span className={`block h-full rounded-full ${value >= 70 ? "bg-emerald-500" : value >= 40 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${value}%` }} />
                </span>
                <span className="w-32 shrink-0 text-right text-xs text-muted-foreground tabular-nums">{n} de {list.length} ({value}%)</span>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0">
          <CardTitle>Usuários</CardTitle>
          <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-6">
            <FilterTabs options={platformOptions} value={platform} onChange={(p) => { setPlatform(p); setPage(1); }} label="Filtrar por plataforma" />
            <FilterTabs options={statusOptions} value={status} onChange={(s) => { setStatus(s); setPage(1); }} label="Filtrar por situação do push" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Usuário</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Plataforma / versão</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead className="pr-6">Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12 text-sm">Nenhum usuário nesse filtro</TableCell>
                </TableRow>
              ) : pageRows.map(({ u, s }) => (
                <TableRow key={u.id}>
                  <TableCell className="pl-6 text-sm font-medium">{u.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.platform ? (u.platform === "ios" ? "iOS" : "Android") : "—"}
                    {u.appVersion && <span className="ml-2 font-mono text-xs">v{u.appVersion}</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {u.hasExpoToken && <Badge variant="outline" className="text-[10px]">Expo</Badge>}
                      {u.hasFcmToken && <Badge variant="outline" className="text-[10px]">FCM</Badge>}
                      {!u.hasExpoToken && !u.hasFcmToken && <span className="text-xs text-muted-foreground">nenhum</span>}
                    </div>
                  </TableCell>
                  <TableCell className="pr-6">
                    {s === "ok" && <Badge className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10">Recebe push</Badge>}
                    {s === "no_token" && <Badge variant="destructive" className="text-xs">Sem token</Badge>}
                    {s === "disabled" && <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-700">Desativou</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <Pagination page={page} total={rows.length} onPageChange={setPage} />
      </Card>
    </div>
  );
}
