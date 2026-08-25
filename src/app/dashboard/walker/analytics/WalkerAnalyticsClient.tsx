"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Users, Footprints, Star, Banknote, Timer, MapPin, Zap,
  TrendingUp, Activity, Wrench,
} from "lucide-react";

type KPIs = {
  totalWalkers: number;
  activeWalkers: number;
  proCount: number;
  freeCount: number;
  totalSessions: number;
  totalKm: number;
  avgRating: number;
  totalRatings: number;
  totalRevenue: number;
  totalHours: number;
  activeServices: number;
};

type Props = {
  data: {
    chartData: Record<string, string | number>[];
    kpis: KPIs;
  };
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "primary",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color?: "primary" | "emerald" | "amber" | "violet" | "blue" | "rose";
}) {
  const colors: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-500/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-600",
    violet: "bg-violet-500/10 text-violet-600",
    blue: "bg-blue-500/10 text-blue-600",
    rose: "bg-rose-500/10 text-rose-600",
  };
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-heading font-bold leading-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            {sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function WalkerAnalyticsClient({ data }: Props) {
  const { chartData, kpis } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Analytics Walker</h1>
        <p className="text-muted-foreground text-sm mt-1">Métricas e tendências do Zupet Walker</p>
      </div>

      {/* KPIs - Walkers */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Walkers</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total de walkers" value={kpis.totalWalkers.toLocaleString("pt-BR")} color="primary" />
          <StatCard icon={Activity} label="Walkers ativos" value={kpis.activeWalkers.toLocaleString("pt-BR")} color="emerald" />
          <StatCard icon={Zap} label="Plano Pro" value={kpis.proCount.toLocaleString("pt-BR")} color="violet" />
          <StatCard icon={Wrench} label="Serviços ativos" value={kpis.activeServices.toLocaleString("pt-BR")} color="blue" />
        </div>
      </div>

      {/* KPIs - Passeios */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Passeios</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard icon={Footprints} label="Passeios concluídos" value={kpis.totalSessions.toLocaleString("pt-BR")} color="primary" />
          <StatCard icon={MapPin} label="Km percorridos" value={`${kpis.totalKm.toLocaleString("pt-BR")} km`} color="emerald" />
          <StatCard icon={Timer} label="Horas de passeio" value={`${kpis.totalHours.toLocaleString("pt-BR")} h`} color="amber" />
        </div>
      </div>

      {/* KPIs - Qualidade e Receita */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Qualidade & Receita</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard icon={Star} label="Avaliação média" value={kpis.avgRating > 0 ? `${kpis.avgRating} ★` : "—"} sub={`${kpis.totalRatings.toLocaleString("pt-BR")} avaliações`} color="amber" />
          <StatCard icon={TrendingUp} label="Avaliações totais" value={kpis.totalRatings.toLocaleString("pt-BR")} color="blue" />
          <StatCard icon={Banknote} label="Receita total" value={kpis.totalRevenue > 0 ? `R$ ${kpis.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "R$ 0,00"} color="emerald" />
        </div>
      </div>

      {/* Gráfico: Crescimento de walkers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Crescimento de Walkers (últimos 6 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="walkerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="Walkers" stroke="hsl(var(--primary))" fill="url(#walkerGrad)" strokeWidth={2} dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico: Passeios por mês */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Passeios & Avaliações por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Passeios" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Avaliações" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico: Receita por mês */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Receita por Mês (R$)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, "Receita"]}
                />
                <Line type="monotone" dataKey="Receita (R$)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
