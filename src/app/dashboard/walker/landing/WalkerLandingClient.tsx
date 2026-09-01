"use client";

import { Globe, Code2, ExternalLink, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WalkerLead } from "./page";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

export function WalkerLandingClient({ leads }: { leads: WalkerLead[] }) {
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

      {/* Placeholder central */}
      <Card className="border-dashed border-2 border-border">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Globe className="w-8 h-8 text-primary" />
          </div>

          <div className="max-w-md space-y-2">
            <h2 className="text-lg font-semibold">Nenhum dado disponível ainda</h2>
            <p className="text-sm text-muted-foreground">
              As métricas de visitas e cliques estarão disponíveis aqui assim que o script de
              tracking for configurado no site do Walker.
            </p>
          </div>

          {/* Instrução de configuração */}
          <div className="w-full max-w-lg">
            <Card className="bg-muted/50 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-muted-foreground" />
                  Como configurar o tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-left">
                <p className="text-xs text-muted-foreground">
                  Adicione o script de tracking no projeto{" "}
                  <code className="px-1.5 py-0.5 rounded bg-background font-mono text-foreground">
                    zupet-walker-web
                  </code>{" "}
                  para começar a receber dados aqui:
                </p>
                <pre className="text-xs bg-background rounded-lg p-3 overflow-x-auto border border-border text-foreground font-mono whitespace-pre-wrap">
{`// Em cada page view — enviar para a API do dashboard
await fetch('/api/tracking/page-view', {
  method: 'POST',
  body: JSON.stringify({
    page: window.location.pathname,
    source: 'walker.zupet.io',
    device: /Mobi/.test(navigator.userAgent)
      ? 'mobile' : 'desktop',
    country: 'BR', // usar Vercel geo headers
  }),
})`}
                </pre>
                <p className="text-xs text-muted-foreground">
                  Os dados passarão a aparecer nesta página assim que o primeiro evento for registrado.
                </p>
              </CardContent>
            </Card>
          </div>

          <a
            href="https://walker.zupet.io"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Globe className="w-4 h-4" />
            Abrir walker.zupet.io
          </a>
        </CardContent>
      </Card>

      {/* Prévia dos cards que aparecerão quando houver dados */}
      <div>
        <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide font-medium">
          Quando os dados chegarem, você verá:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "Visitas no período",
            "Cadastros iniciados",
            "CTR do período",
            "Mobile vs Desktop",
          ].map((label) => (
            <Card key={label} className="opacity-40">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
                <div className="h-7 w-16 rounded bg-muted animate-none" />
                <div className="h-3 w-24 rounded bg-muted mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
