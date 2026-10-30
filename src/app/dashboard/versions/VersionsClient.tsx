"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import FilterTabs from "@/components/FilterTabs";
import Pagination, { PAGE_SIZE } from "@/components/Pagination";
import { compareVersions, compareVersionsDesc } from "@/lib/semver";
import type { AppUser } from "@/lib/app-users";
import { Smartphone, Rocket, History, HelpCircle } from "lucide-react";

type PlatformFilter = "all" | "android" | "ios";
type StatusFilter = "all" | "latest" | "outdated" | "none";

export default function VersionsClient({ users }: { users: AppUser[] }) {
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [version, setVersion] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Maior versão já registrada por algum usuário = "última versão em uso"
  const latest = users
    .map((u) => u.appVersion)
    .filter((v): v is string => !!v)
    .sort(compareVersionsDesc)[0] ?? null;

  const inPlatform = users.filter((u) => platform === "all" || u.platform === platform);
  const withVersion = inPlatform.filter((u) => u.appVersion);
  const onLatest = withVersion.filter((u) => u.appVersion === latest).length;
  const outdated = withVersion.length - onLatest;
  const noVersion = inPlatform.length - withVersion.length;

  const counts: Record<string, number> = {};
  for (const u of withVersion) counts[u.appVersion!] = (counts[u.appVersion!] ?? 0) + 1;
  const versions = Object.keys(counts).sort(compareVersionsDesc);
  const maxCount = Math.max(1, ...Object.values(counts));

  const rows = inPlatform
    .filter((u) => {
      if (version) return u.appVersion === version;
      if (status === "latest") return !!latest && u.appVersion === latest;
      if (status === "outdated") return !!u.appVersion && u.appVersion !== latest;
      if (status === "none") return !u.appVersion;
      return true;
    })
    .sort((a, b) => compareVersions(b.appVersion ?? "0", a.appVersion ?? "0") || a.name.localeCompare(b.name));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pct = (n: number) => (withVersion.length > 0 ? Math.round((n / withVersion.length) * 100) : 0);
  const reset = () => setPage(1);

  const platformOptions = [
    { key: "all" as const, label: "Todas", count: users.length },
    { key: "android" as const, label: "Android", count: users.filter((u) => u.platform === "android").length },
    { key: "ios" as const, label: "iOS", count: users.filter((u) => u.platform === "ios").length },
  ];
  const statusOptions = [
    { key: "all" as const, label: "Todos", count: inPlatform.length },
    { key: "latest" as const, label: "Última versão", count: onLatest },
    { key: "outdated" as const, label: "Desatualizados", count: outdated },
    { key: "none" as const, label: "Sem versão", count: noVersion },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Versões do App</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Em qual versão cada usuário está. A versão é gravada quando a pessoa abre o app.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-muted-foreground">Plataforma</span>
        <FilterTabs options={platformOptions} value={platform} onChange={(p) => { setPlatform(p); setVersion(null); setStatus("all"); reset(); }} label="Filtrar por plataforma" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Rocket className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-heading font-bold font-mono">{latest ? `v${latest}` : "—"}</p><p className="text-xs text-muted-foreground">Última versão em uso</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Smartphone className="h-5 w-5 text-emerald-600" /></div>
            <div><p className="text-2xl font-heading font-bold">{pct(onLatest)}%</p><p className="text-xs text-muted-foreground">Na última versão ({onLatest})</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><History className="h-5 w-5 text-amber-600" /></div>
            <div><p className="text-2xl font-heading font-bold">{outdated}</p><p className="text-xs text-muted-foreground">Em versão anterior</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center"><HelpCircle className="h-5 w-5 text-muted-foreground" /></div>
            <div><p className="text-2xl font-heading font-bold">{noVersion}</p><p className="text-xs text-muted-foreground">Sem versão registrada</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários por versão</CardTitle>
          <CardDescription>Clique numa barra para ver quem está naquela versão. Clique de novo para limpar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {versions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Nenhuma versão registrada</p>
          ) : versions.map((v) => {
            const n = counts[v];
            const selected = version === v;
            return (
              <button
                key={v}
                type="button"
                aria-pressed={selected}
                onClick={() => { setVersion(selected ? null : v); setStatus("all"); reset(); }}
                className={`flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-secondary/60 ${selected ? "bg-secondary" : ""}`}
                style={{ opacity: version && !selected ? 0.4 : 1 }}
              >
                <span className="w-16 shrink-0 font-mono text-sm font-medium">v{v}</span>
                <span className="h-2.5 flex-1 rounded-full bg-secondary overflow-hidden">
                  <span
                    className={`block h-full rounded-full ${v === latest ? "bg-primary" : "bg-muted-foreground/50"}`}
                    style={{ width: `${(n / maxCount) * 100}%` }}
                  />
                </span>
                <span className="w-20 shrink-0 text-right text-xs text-muted-foreground tabular-nums">{n} ({pct(n)}%)</span>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0">
          <CardTitle>{version ? `Usuários na v${version}` : "Usuários"}</CardTitle>
          {version ? (
            <button onClick={() => { setVersion(null); reset(); }} className="self-start text-xs px-3 h-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary">
              Limpar filtro de versão ✕
            </button>
          ) : (
            <FilterTabs options={statusOptions} value={status} onChange={(s) => { setStatus(s); reset(); }} label="Filtrar por situação da versão" />
          )}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Usuário</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead className="pr-6">Última atualização do perfil</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12 text-sm">Nenhum usuário nesse filtro</TableCell>
                </TableRow>
              ) : pageRows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="pl-6 text-sm font-medium">{u.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    {u.platform ? <Badge variant="outline" className="text-xs">{u.platform === "ios" ? "iOS" : "Android"}</Badge> : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    {u.appVersion ? (
                      <Badge variant="outline" className={`text-xs font-mono ${u.appVersion === latest ? "border-primary/40 text-primary" : ""}`}>v{u.appVersion}</Badge>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="pr-6 text-sm text-muted-foreground">
                    {u.updatedAt ? new Date(u.updatedAt).toLocaleDateString("pt-BR") : "—"}
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
