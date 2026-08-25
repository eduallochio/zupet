"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { Users, Activity, Zap, Calendar, Footprints, MapPin, Star, Clock, Wrench, Banknote } from "lucide-react";

type WalkerStats = {
  totalWalkers: number;
  activeWalkers: number;
  proWalkers: number;
  newWalkersThisMonth: number;
  totalSessions: number;
  ongoingSessions: number;
  totalKm: number;
  totalMinutes: number;
  avgRating: number;
  totalRatings: number;
  activeServices: number;
  totalServices: number;
  paidAmount: number;
  pendingAmount: number;
  walkerGrowthData: { date: string; Walkers: number }[];
  sessionGrowthData: { date: string; Passeios: number }[];
};

const walkerChartConfig: ChartConfig = {
  Walkers: { label: "Walkers", color: "hsl(174 60% 40%)" },
};

const sessionChartConfig: ChartConfig = {
  Passeios: { label: "Passeios", color: "hsl(262 60% 58%)" },
};

function KpiCard({
  title, value, sub, icon: Icon, iconBg = "bg-primary/10", iconColor = "text-primary",
}: {
  title: string; value: string | number; sub: string; icon: React.ElementType;
  iconBg?: string; iconColor?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-heading font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

export default function WalkerOverviewClient({ stats }: { stats: WalkerStats }) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [router]);

  const totalHours = (stats.totalMinutes / 60).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Visão Geral — Walker</h1>
        <p className="text-muted-foreground text-sm mt-1">Métricas do app Zupet Walker — atualizado agora</p>
      </div>

      {/* Walkers KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Total de Walkers" value={stats.totalWalkers.toLocaleString("pt-BR")} icon={Users} sub="registrados" />
        <KpiCard title="Walkers Ativos" value={stats.activeWalkers.toLocaleString("pt-BR")} icon={Activity} iconBg="bg-emerald-500/10" iconColor="text-emerald-600" sub="com conta ativa" />
        <KpiCard title="Plano Pro" value={stats.proWalkers.toLocaleString("pt-BR")} icon={Zap} iconBg="bg-violet-500/10" iconColor="text-violet-600" sub="assinantes" />
        <KpiCard title="Novos (30d)" value={stats.newWalkersThisMonth.toLocaleString("pt-BR")} icon={Calendar} iconBg="bg-amber-500/10" iconColor="text-amber-600" sub="cadastros recentes" />
      </div>

      {/* Passeios KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Passeios Concluídos" value={stats.totalSessions.toLocaleString("pt-BR")} icon={Footprints} sub="sessões finalizadas" />
        <KpiCard title="Em Andamento" value={stats.ongoingSessions.toLocaleString("pt-BR")} icon={Activity} iconBg="bg-emerald-500/10" iconColor="text-emerald-600" sub="sessões ativas agora" />
        <KpiCard title="Km Percorridos" value={stats.totalKm.toLocaleString("pt-BR")} icon={MapPin} iconBg="bg-violet-500/10" iconColor="text-violet-600" sub="quilômetros no total" />
        <KpiCard title="Horas em Campo" value={`${Number(totalHours).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}h`} icon={Clock} iconBg="bg-amber-500/10" iconColor="text-amber-600" sub="tempo total de passeios" />
      </div>

      {/* Avaliações + Serviços + Pagamentos */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KpiCard title="Avaliação Média" value={stats.avgRating > 0 ? stats.avgRating.toFixed(1) + " ★" : "—"} icon={Star} iconBg="bg-amber-500/10" iconColor="text-amber-600" sub={`${stats.totalRatings.toLocaleString("pt-BR")} avaliações`} />
        <KpiCard title="Serviços Ativos" value={`${stats.activeServices} / ${stats.totalServices}`} icon={Wrench} iconBg="bg-emerald-500/10" iconColor="text-emerald-600" sub="ativos / total cadastrados" />
        <KpiCard title="Recebido (Pago)" value={stats.paidAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} icon={Banknote} iconBg="bg-primary/10" iconColor="text-primary" sub={`${stats.pendingAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} pendente`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Walkers</CardTitle>
            <CardDescription>Novos walkers cadastrados por mês (últimos 6 meses)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={walkerChartConfig} className="h-56 w-full">
              <AreaChart data={stats.walkerGrowthData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWalkers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(174 60% 40%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(174 60% 40%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={28} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area type="monotone" dataKey="Walkers" stroke="hsl(174 60% 40%)" strokeWidth={2} fill="url(#colorWalkers)" dot={false} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Passeios por Mês</CardTitle>
            <CardDescription>Sessões concluídas por mês (últimos 6 meses)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={sessionChartConfig} className="h-56 w-full">
              <BarChart data={stats.sessionGrowthData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={28} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="Passeios" fill="hsl(262 60% 58%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
