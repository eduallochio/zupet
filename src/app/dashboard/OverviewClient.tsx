"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import FilterTabs from "@/components/FilterTabs";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import {
  Users, PawPrint, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, UserCheck, Bug, Smartphone,
  BellOff, Trash2, Copy, CheckCircle2, Footprints, ChevronRight,
} from "lucide-react";

type Stats = {
  generatedAt: string;
  totalUsers: number;
  totalPets: number;
  avgPets: number;
  active7d: number;
  active30d: number;
  dailySeries: { date: string; users: number; pets: number }[];
  speciesData: { name: string; value: number }[];
  recentUsers: { id: string; name: string; email: string; createdAt: string }[];
  attention: {
    pendingErrors: number;
    outdatedUsers: number;
    latestVersion: string | null;
    noPushUsers: number;
    pendingDeletions: number;
    duplicateGroups: number;
  };
  walker: { total: number; new30d: number; pro: number; walks: number; km: number };
};

type Period = "7" | "30" | "90";

const areaChartConfig: ChartConfig = {
  Usuários: { label: "Usuários", color: "hsl(174 60% 40%)" },
  Pets: { label: "Pets", color: "hsl(262 60% 58%)" },
};

const PIE_COLORS = [
  "hsl(174 60% 40%)",
  "hsl(262 60% 58%)",
  "hsl(45 90% 55%)",
  "hsl(340 75% 58%)",
  "hsl(210 80% 55%)",
  "hsl(120 50% 45%)",
];

const pctChange = (cur: number, prev: number) => (prev > 0 ? Math.round(((cur - prev) / prev) * 100) : cur > 0 ? 100 : 0);
const sum = (list: { users: number; pets: number }[], key: "users" | "pets") => list.reduce((a, d) => a + d[key], 0);

function formatDay(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 30) return `há ${days} dias`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

function KpiCard({
  title, value, sub, icon: Icon, trend, href,
}: {
  title: string; value: string | number; sub: string; icon: React.ElementType; trend?: number; href?: string;
}) {
  const up = (trend ?? 0) >= 0;
  const card = (
    <Card className={href ? "transition-colors hover:bg-secondary/40" : ""}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-heading font-bold">{value}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {trend !== undefined && (
            <span className={`flex items-center text-xs font-semibold ${up ? "text-emerald-600" : "text-red-500"}`}>
              {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(trend)}%
            </span>
          )}
          <span className="text-xs text-muted-foreground">{sub}</span>
        </div>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">{card}</Link> : card;
}

function AttentionItem({
  href, icon: Icon, count, label, tone,
}: {
  href: string; icon: React.ElementType; count: number; label: string; tone: "danger" | "warning" | "info";
}) {
  const active = count > 0;
  const colors = {
    danger: "bg-rose-500/10 text-rose-600 border-rose-500/30",
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    info: "bg-sky-500/10 text-sky-600 border-sky-500/30",
  }[tone];
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${active ? colors : "border-border text-muted-foreground"}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className={`text-xl font-heading font-bold leading-none ${active ? "" : "text-foreground/70"}`}>{count}</p>
        <p className="text-xs mt-1 truncate text-muted-foreground">{label}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
    </Link>
  );
}

export default function OverviewClient({ stats }: { stats: Stats }) {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("30");

  // Auto-refresh a cada 5 minutos para manter os dados atualizados
  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [router]);

  const days = Number(period);
  const series = stats.dailySeries;
  const current = series.slice(-days);
  const previous = series.slice(-days * 2, -days);

  const newUsers = sum(current, "users");
  const newPets = sum(current, "pets");
  const usersTrend = pctChange(newUsers, sum(previous, "users"));
  const petsTrend = pctChange(newPets, sum(previous, "pets"));
  const trendLabel = `vs ${days} dias anteriores`;

  const periodOptions = (["7", "30", "90"] as Period[]).map((p) => ({
    key: p,
    label: `${p} dias`,
    count: sum(series.slice(-Number(p)), "users"),
  }));

  const chartData = current.map((d) => ({ date: formatDay(d.date), Usuários: d.users, Pets: d.pets }));

  const speciesTotal = stats.speciesData.reduce((a, b) => a + b.value, 0);
  const goToSpecies = (name: string) => router.push(`/dashboard/pets?species=${encodeURIComponent(name)}`);

  const a = stats.attention;
  const attentionTotal = a.pendingErrors + a.outdatedUsers + a.noPushUsers + a.pendingDeletions + a.duplicateGroups;
  const activePct = (n: number) => (stats.totalUsers > 0 ? Math.round((n / stats.totalUsers) * 100) : 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Visão Geral</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Métricas do app Zupet — dados de {new Date(stats.generatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Período</span>
          <FilterTabs options={periodOptions} value={period} onChange={setPeriod} label="Período das métricas" clearable={false} />
        </div>
      </div>

      {/* Atenção agora */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Atenção agora</CardTitle>
              <CardDescription>O que pode precisar de uma ação sua</CardDescription>
            </div>
            {attentionTotal === 0 && (
              <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Tudo em ordem
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <AttentionItem href="/dashboard/erros" icon={Bug} count={a.pendingErrors} label="Erros do app pendentes" tone="danger" />
          <AttentionItem href="/dashboard/versions" icon={Smartphone} count={a.outdatedUsers} label={a.latestVersion ? `Usuários abaixo da v${a.latestVersion}` : "Usuários em versão antiga"} tone="warning" />
          <AttentionItem href="/dashboard/push" icon={BellOff} count={a.noPushUsers} label="Usuários sem push" tone="warning" />
          <AttentionItem href="/dashboard/deletions" icon={Trash2} count={a.pendingDeletions} label="Exclusões de conta pendentes" tone="danger" />
          <AttentionItem href="/dashboard/users" icon={Copy} count={a.duplicateGroups} label="Possíveis contas duplicadas" tone="info" />
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Total de Usuários" value={stats.totalUsers.toLocaleString("pt-BR")} icon={Users} sub="contas criadas" href="/dashboard/users" />
        <KpiCard title="Total de Pets" value={stats.totalPets.toLocaleString("pt-BR")} icon={PawPrint} sub={`${stats.avgPets} por usuário`} href="/dashboard/pets" />
        <KpiCard title="Ativos (7 dias)" value={stats.active7d} icon={UserCheck} sub={`${activePct(stats.active7d)}% dos usuários`} href="/dashboard/retention" />
        <KpiCard title="Ativos (30 dias)" value={stats.active30d} icon={Activity} sub={`${activePct(stats.active30d)}% dos usuários`} href="/dashboard/retention" />
        <KpiCard title={`Novos usuários (${days}d)`} value={newUsers} icon={TrendingUp} trend={usersTrend} sub={trendLabel} />
        <KpiCard title={`Novos pets (${days}d)`} value={newPets} icon={PawPrint} trend={petsTrend} sub={trendLabel} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cadastros por dia</CardTitle>
            <CardDescription>Usuários e pets nos últimos {days} dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={areaChartConfig} className="h-64 w-full">
              <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(174 60% 40%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(174 60% 40%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(262 60% 58%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(262 60% 58%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={24} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area type="monotone" dataKey="Usuários" stroke="hsl(174 60% 40%)" strokeWidth={2} fill="url(#colorUsers)" dot={false} />
                <Area type="monotone" dataKey="Pets" stroke="hsl(262 60% 58%)" strokeWidth={2} fill="url(#colorPets)" dot={false} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Espécies de Pets</CardTitle>
            <CardDescription>Clique para ver os pets da espécie</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.speciesData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">Nenhum pet ainda</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={stats.speciesData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {stats.speciesData.map((s, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                          style={{ cursor: "pointer", outline: "none" }}
                          onClick={() => goToSpecies(s.name)}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip formatter={(value, name) => [value, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-2">
                  {stats.speciesData.map((s, i) => {
                    const pct = speciesTotal > 0 ? Math.round((s.value / speciesTotal) * 100) : 0;
                    return (
                      <Link
                        key={s.name}
                        href={`/dashboard/pets?species=${encodeURIComponent(s.name)}`}
                        className="flex items-center gap-2 text-sm rounded-md px-2 py-1 -mx-2 hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      >
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="flex-1 text-foreground">{s.name}</span>
                        <span className="text-muted-foreground text-xs">{s.value} ({pct}%)</span>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent users */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Usuários Recentes</CardTitle>
                <CardDescription>Últimas contas criadas no Zupet</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">Últimos 5</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum usuário ainda</p>
            ) : (
              stats.recentUsers.map((u, i) => (
                <div key={u.id}>
                  <Link href={`/dashboard/users/${u.id}`} className="flex items-center gap-3 rounded-md hover:bg-secondary/50 -mx-2 px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap" title={new Date(u.createdAt).toLocaleString("pt-BR")}>
                      {timeAgo(u.createdAt)}
                    </span>
                  </Link>
                  {i < stats.recentUsers.length - 1 && <Separator className="mt-3" />}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Resumo do walker */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Zupet Walker</CardTitle>
                <CardDescription>Resumo do outro lado do produto</CardDescription>
              </div>
              <Link href="/dashboard/walker/overview" className="text-xs text-primary hover:underline">Ver detalhes</Link>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {[
              { label: "Walkers cadastrados", value: stats.walker.total, sub: `+${stats.walker.new30d} em 30 dias` },
              { label: "Plano Pro", value: stats.walker.pro, sub: `de ${stats.walker.total} walkers` },
              { label: "Passeios concluídos", value: stats.walker.walks, sub: "no total" },
              { label: "Distância percorrida", value: `${stats.walker.km.toLocaleString("pt-BR")} km`, sub: "no total" },
            ].map((m) => (
              <div key={m.label} className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Footprints className="h-3.5 w-3.5" aria-hidden="true" /> {m.label}
                </div>
                <p className="text-2xl font-heading font-bold mt-1">{m.value}</p>
                <p className="text-[11px] text-muted-foreground">{m.sub}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
