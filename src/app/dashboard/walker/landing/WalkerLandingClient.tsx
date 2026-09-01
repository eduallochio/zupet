"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, MousePointerClick, Smartphone, TrendingUp, Users, ExternalLink } from "lucide-react";
import type { WalkerLead, LandingData } from "./page";

const COLORS = {
  views: "#34d399",
  android: "#34d399",
  ios: "#818cf8",
  mobile: "#34d399",
  tablet: "#818cf8",
  desktop: "#f59e0b",
};

const PRESETS = [
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" },
  { label: "90 dias", value: "90d" },
  { label: "Tudo", value: "all" },
];

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function formatDatetime(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

interface Props {
  data: LandingData;
  preset: string;
  fromDate?: string;
  toDate?: string;
  leads: WalkerLead[];
}

export function WalkerLandingClient({ data, preset, fromDate, toDate, leads }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { series, totalViews, totalClicks, periodViews, periodClicks, androidClicks, iosClicks, ctr, deviceViews } = data;

  const [customFrom, setCustomFrom] = useState(fromDate ?? "");
  const [customTo, setCustomTo] = useState(toDate ?? "");

  function applyPreset(p: string) {
    router.push(`${pathname}?preset=${p}`);
  }

  function applyCustom() {
    if (!customFrom || !customTo) return;
    router.push(`${pathname}?from=${customFrom}&to=${customTo}`);
  }

  const kpis = [
    { label: "Visitas no período", value: periodViews.toLocaleString("pt-BR"), sub: `${totalViews.toLocaleString("pt-BR")} total`, icon: Globe, color: "text-emerald-400" },
    { label: "Cliques no período", value: periodClicks.toLocaleString("pt-BR"), sub: `${totalClicks.toLocaleString("pt-BR")} total`, icon: MousePointerClick, color: "text-indigo-400" },
    { label: "CTR do período", value: `${ctr}%`, sub: "cliques / visitas", icon: TrendingUp, color: "text-amber-400" },
    { label: "Mobile vs Desktop", value: `${deviceViews.mobile} / ${deviceViews.desktop}`, sub: `${deviceViews.tablet} tablet`, icon: Smartphone, color: "text-rose-400" },
  ];

  const deviceData = [
    { name: "Mobile", value: deviceViews.mobile },
    { name: "Tablet", value: deviceViews.tablet },
    { name: "Desktop", value: deviceViews.desktop },
  ].filter((d) => d.value > 0);

  const storeData = [
    { name: "Android", value: androidClicks },
    { name: "iOS", value: iosClicks },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header + filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Landing Page Walker</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visitas e cliques —{" "}
            <a href="https://walker.zupet.io" target="_blank" rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1">
              walker.zupet.io <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
            {PRESETS.map((p) => (
              <button key={p.value} onClick={() => applyPreset(p.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  preset === p.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
              className="h-8 px-2 rounded-md text-xs bg-muted border border-border text-foreground" />
            <span className="text-xs text-muted-foreground">até</span>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
              className="h-8 px-2 rounded-md text-xs bg-muted border border-border text-foreground" />
            <button onClick={applyCustom} disabled={!customFrom || !customTo}
              className="h-8 px-3 rounded-md text-xs font-medium bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity">
              Aplicar
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">{label}</span>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visitas por dia */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Visitas por dia</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={series}>
              <defs>
                <linearGradient id="gWalkerViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.views} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.views} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} stroke="#374151" />
              <YAxis tick={{ fontSize: 11 }} stroke="#374151" allowDecimals={false} />
              <Tooltip
                formatter={(v) => [v, "visitas"]}
                labelFormatter={(l) => formatDate(l)}
                contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 8 }}
              />
              <Area type="monotone" dataKey="views" stroke={COLORS.views} fill="url(#gWalkerViews)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cliques nas lojas por dia */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Cliques nas lojas por dia</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} stroke="#374151" />
              <YAxis tick={{ fontSize: 11 }} stroke="#374151" allowDecimals={false} />
              <Tooltip
                labelFormatter={(l) => formatDate(l)}
                contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 8 }}
              />
              <Legend />
              <Bar dataKey="android" name="Android" fill={COLORS.android} radius={[4, 4, 0, 0]} />
              <Bar dataKey="ios" name="iOS" fill={COLORS.ios} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Donuts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cliques por loja (período)</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center gap-8">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={storeData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" paddingAngle={3}>
                  <Cell fill={COLORS.android} />
                  <Cell fill={COLORS.ios} />
                </Pie>
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3 text-sm">
              {storeData.map((s, i) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: i === 0 ? COLORS.android : COLORS.ios }} />
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="font-bold ml-auto pl-4">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Visitas por dispositivo (período)</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center gap-8">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" paddingAngle={3}>
                  {deviceData.map((_, i) => (
                    <Cell key={i} fill={[COLORS.mobile, COLORS.tablet, COLORS.desktop][i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3 text-sm">
              {deviceData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: [COLORS.mobile, COLORS.tablet, COLORS.desktop][i] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-bold ml-auto pl-4">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads captados */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Leads captados
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {leads.length} {leads.length === 1 ? "contato" : "contatos"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Nenhum lead ainda. Os cadastros feitos no formulário do site aparecerão aqui.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wide">
                    <th className="text-left py-2 pr-4 font-medium">Nome</th>
                    <th className="text-left py-2 pr-4 font-medium">WhatsApp</th>
                    <th className="text-left py-2 pr-4 font-medium">Instagram</th>
                    <th className="text-left py-2 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 pr-4 font-medium">{lead.name}</td>
                      <td className="py-2.5 pr-4">
                        <a href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
                          target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {lead.phone}
                        </a>
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {lead.instagram ? (
                          <a href={`https://instagram.com/${lead.instagram.replace(/^@/, "")}`}
                            target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            @{lead.instagram.replace(/^@/, "")}
                          </a>
                        ) : "—"}
                      </td>
                      <td className="py-2.5 text-muted-foreground text-xs">{formatDatetime(lead.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
