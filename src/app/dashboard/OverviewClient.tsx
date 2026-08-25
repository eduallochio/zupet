"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts";
import { Users, PawPrint, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";

type Stats = {
  totalUsers: number;
  totalPets: number;
  newUsersThisMonth: number;
  newPetsThisMonth: number;
  userGrowth: number;
  avgPets: number;
  speciesData: { name: string; value: number }[];
  chartData: { date: string; Usuários: number; Pets: number }[];
  recentUsers: { name: string; value: string }[];
};

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

function KpiCard({
  title, value, sub, icon: Icon, trend,
}: {
  title: string; value: string | number; sub: string; icon: React.ElementType; trend?: number;
}) {
  const up = (trend ?? 0) >= 0;
  return (
    <Card>
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
}

export default function OverviewClient({ stats }: { stats: Stats }) {
  const router = useRouter();

  // Auto-refresh a cada 5 minutos para manter os dados atualizados
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Visão Geral</h1>
        <p className="text-muted-foreground text-sm mt-1">Métricas do app Zupet — atualizado agora</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Total de Usuários" value={stats.totalUsers.toLocaleString("pt-BR")} icon={Users} trend={stats.userGrowth} sub="vs mês anterior" />
        <KpiCard title="Total de Pets" value={stats.totalPets.toLocaleString("pt-BR")} icon={PawPrint} sub={`+${stats.newPetsThisMonth} este mês`} />
        <KpiCard title="Novos Usuários (30d)" value={stats.newUsersThisMonth} icon={TrendingUp} sub="cadastros recentes" />
        <KpiCard title="Pets por Usuário" value={stats.avgPets} icon={Activity} sub="em média" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Crescimento Mensal</CardTitle>
            <CardDescription>Usuários e pets nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={areaChartConfig} className="h-64 w-full">
              <AreaChart data={stats.chartData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
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
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area type="monotone" dataKey="Usuários" stroke="hsl(174 60% 40%)" strokeWidth={2} fill="url(#colorUsers)" dot={false} />
                <Area type="monotone" dataKey="Pets" stroke="hsl(262 60% 58%)" strokeWidth={2} fill="url(#colorPets)" dot={false} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Donut chart */}
        <Card>
          <CardHeader>
            <CardTitle>Espécies de Pets</CardTitle>
            <CardDescription>Distribuição por tipo de animal</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.speciesData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">Nenhum pet ainda</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={stats.speciesData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {stats.speciesData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip formatter={(value, name) => [value, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {stats.speciesData.map((s, i) => {
                    const total = stats.speciesData.reduce((a, b) => a + b.value, 0);
                    const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
                    return (
                      <div key={s.name} className="flex items-center gap-2 text-sm">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="flex-1 text-foreground">{s.name}</span>
                        <span className="text-muted-foreground text-xs">{s.value} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

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
              <div key={i}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.value}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Recente
                  </div>
                </div>
                {i < stats.recentUsers.length - 1 && <Separator className="mt-3" />}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
