"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import { Footprints, MapPin, Clock, Activity } from "lucide-react";

type PasseiosData = {
  totalConcluded: number;
  totalOngoing: number;
  totalDistanceMeters: number;
  totalDurationMinutes: number;
  sessionsByMonth: { month: string; Passeios: number }[];
  recentSessions: {
    id: string;
    walkerName: string;
    distanceMeters: number;
    durationMinutes: number;
    petCount: number;
    createdAt: string;
  }[];
};

const passeiosConfig: ChartConfig = {
  Passeios: { label: "Passeios concluídos", color: "hsl(174 60% 40%)" },
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
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
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

export default function PasseiosClient({ data }: { data: PasseiosData }) {
  const totalKm = (data.totalDistanceMeters / 1000).toFixed(1);
  const totalHours = (data.totalDurationMinutes / 60).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Passeios</h1>
        <p className="text-muted-foreground text-sm mt-1">Sessões de passeio registradas no Zupet</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          icon={Footprints}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          value={data.totalConcluded.toLocaleString("pt-BR")}
          label="Passeios concluídos"
        />
        <KpiCard
          icon={MapPin}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-600"
          value={`${Number(totalKm).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`}
          label="Km totais percorridos"
        />
        <KpiCard
          icon={Clock}
          iconBg="bg-violet-500/10"
          iconColor="text-violet-600"
          value={`${Number(totalHours).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}h`}
          label="Tempo total"
        />
        <KpiCard
          icon={Activity}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-600"
          value={data.totalOngoing.toLocaleString("pt-BR")}
          label="Em andamento"
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Passeios por Mês</CardTitle>
          <CardDescription>Sessões concluídas nos últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={passeiosConfig} className="h-64 w-full">
            <BarChart data={data.sessionsByMonth} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                width={28}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="Passeios" fill="hsl(174 60% 40%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Recent sessions table */}
      <Card>
        <CardHeader>
          <CardTitle>Sessões Recentes</CardTitle>
          <CardDescription>Últimas 20 sessões concluídas</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Walker</TableHead>
                <TableHead>Distância</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Pets</TableHead>
                <TableHead className="pr-6">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12 text-sm">
                    Nenhuma sessão concluída ainda
                  </TableCell>
                </TableRow>
              ) : (
                data.recentSessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                          {s.walkerName.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm font-medium">{s.walkerName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {(s.distanceMeters / 1000).toFixed(1)} km
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.durationMinutes} min
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.petCount}
                    </TableCell>
                    <TableCell className="pr-6 text-sm text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString("pt-BR")}
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
