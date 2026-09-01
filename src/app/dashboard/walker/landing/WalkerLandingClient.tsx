"use client";

import { Globe, ExternalLink, Users, Eye, Smartphone, Monitor, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WalkerLead, TrackingStats } from "./page";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export function WalkerLandingClient({ leads, stats }: { leads: WalkerLead[]; stats: TrackingStats }) {
  const mobilePercent = stats.totalViews > 0
    ? Math.round((stats.mobileViews / stats.totalViews) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Landing Page Walker</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Métricas do site{" "}
            <a
              href="https://walker.zupet.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              walker.zupet.io
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
        <a
          href="https://walker.zupet.io"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity w-fit"
        >
          <Globe className="w-4 h-4" />
          Abrir walker.zupet.io
        </a>
      </div>

      {/* Stats de visitas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Eye className="w-4 h-4 text-primary" />}
          label="Visitas totais"
          value={stats.totalViews}
        />
        <StatCard
          icon={<Eye className="w-4 h-4 text-blue-500" />}
          label="Últimos 30 dias"
          value={stats.viewsLast30}
        />
        <StatCard
          icon={<Smartphone className="w-4 h-4 text-orange-500" />}
          label="Mobile"
          value={stats.mobileViews}
          sub={`${mobilePercent}% do total`}
        />
        <StatCard
          icon={<Monitor className="w-4 h-4 text-purple-500" />}
          label="Desktop"
          value={stats.desktopViews}
          sub={`${100 - mobilePercent}% do total`}
        />
      </div>

      {/* Cliques nas lojas */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<ShoppingBag className="w-4 h-4 text-green-500" />}
          label="Cliques — Google Play"
          value={stats.androidClicks}
        />
        <StatCard
          icon={<ShoppingBag className="w-4 h-4 text-gray-500" />}
          label="Cliques — App Store"
          value={stats.iosClicks}
        />
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
                        <a
                          href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {lead.phone}
                        </a>
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {lead.instagram ? (
                          <a
                            href={`https://instagram.com/${lead.instagram.replace(/^@/, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            @{lead.instagram.replace(/^@/, "")}
                          </a>
                        ) : "—"}
                      </td>
                      <td className="py-2.5 text-muted-foreground text-xs">{formatDate(lead.created_at)}</td>
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
