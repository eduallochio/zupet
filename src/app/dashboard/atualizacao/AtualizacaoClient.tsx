"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { compareVersions } from "@/lib/semver";
import { CheckCircle, AlertCircle, Loader2, Info, TriangleAlert } from "lucide-react";

type Config = { latest: string; min: string; iosUrl: string; androidUrl: string };

const VERSION_RE = /^\d+(\.\d+){0,2}$/;
const inputCls = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

export default function AtualizacaoClient({
  config,
  lastUpdated,
  lastUpdatedBy,
  versionCounts,
  withoutVersion,
}: {
  config: Config;
  lastUpdated: string | null;
  lastUpdatedBy: string | null;
  versionCounts: Record<string, number>;
  withoutVersion: number;
}) {
  const [latest, setLatest] = useState(config.latest);
  const [min, setMin] = useState(config.min);
  const [iosUrl, setIosUrl] = useState(config.iosUrl);
  const [androidUrl, setAndroidUrl] = useState(config.androidUrl);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const latestOk = VERSION_RE.test(latest.trim());
  const minOk = min.trim() === "" || VERSION_RE.test(min.trim());

  // Prévia: quantos usuários (pela última versão que abriram o app) cairiam em cada situação
  const entries = Object.entries(versionCounts);
  const total = entries.reduce((a, [, n]) => a + n, 0);
  const below = (limit: string) => entries.filter(([v]) => compareVersions(v, limit) < 0).reduce((a, [, n]) => a + n, 0);
  const softCount = latestOk ? below(latest.trim()) - (min.trim() && minOk ? below(min.trim()) : 0) : 0;
  const forceCount = min.trim() && minOk ? below(min.trim()) : 0;

  async function handleSave() {
    setFeedback(null);
    if (!latestOk) return setFeedback({ ok: false, msg: "Informe a versão mais recente, por exemplo 1.34.0" });
    if (!minOk) return setFeedback({ ok: false, msg: "Versão mínima inválida" });
    if (min.trim() && compareVersions(min.trim(), latest.trim()) > 0) {
      return setFeedback({ ok: false, msg: "A versão mínima não pode ser maior que a mais recente" });
    }

    setSaving(true);
    try {
      const res = await fetch("/api/app-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latest: latest.trim(), min: min.trim(), ios_url: iosUrl.trim(), android_url: androidUrl.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erro desconhecido");
      }
      setFeedback({ ok: true, msg: "Configuração salva. O app lê ao ser aberto." });
    } catch (e: unknown) {
      setFeedback({ ok: false, msg: e instanceof Error ? e.message : "Erro ao salvar" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Atualização do App</h1>
        <p className="text-muted-foreground text-sm mt-1">Defina a partir de qual versão o app avisa ou exige a atualização</p>
      </div>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="pt-5 flex gap-3 text-sm">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
          <p className="text-muted-foreground">
            O aviso é um recurso do próprio app: só aparece em quem tem uma versão que já inclui esse recurso (a partir da publicada depois da 1.33.0).
            Quem está em versões anteriores não vê o aviso e precisa atualizar pela loja.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Versões</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="latest" className="text-sm font-medium">Versão mais recente</label>
              <p className="text-xs text-muted-foreground">Quem estiver abaixo vê o aviso &quot;Nova versão disponível&quot; e pode adiar (aparece 1 vez por dia).</p>
              <input id="latest" value={latest} onChange={(e) => setLatest(e.target.value)} className={inputCls} placeholder="1.34.0" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="min" className="text-sm font-medium">Versão mínima (opcional)</label>
              <p className="text-xs text-muted-foreground">Quem estiver abaixo fica <strong>bloqueado</strong> até atualizar. Use só para falhas graves e com a versão já publicada nas duas lojas.</p>
              <input id="min" value={min} onChange={(e) => setMin(e.target.value)} className={inputCls} placeholder="vazio = não bloqueia ninguém" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="ios" className="text-sm font-medium">Link do iOS (opcional)</label>
              <input id="ios" value={iosUrl} onChange={(e) => setIosUrl(e.target.value)} className={inputCls} placeholder="padrão: página do Zupet na App Store" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="android" className="text-sm font-medium">Link do Android (opcional)</label>
              <input id="android" value={androidUrl} onChange={(e) => setAndroidUrl(e.target.value)} className={inputCls} placeholder="padrão: página do Zupet no Google Play" />
            </div>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="text-sm font-medium">Prévia do alcance (pela versão que cada usuário usou por último)</p>
            <p className="text-sm text-muted-foreground">
              Aviso para <strong>{softCount}</strong> de {total} usuários
              {" · "}Bloqueio para <strong className={forceCount > 0 ? "text-rose-600" : ""}>{forceCount}</strong>
              {withoutVersion > 0 && <span> · {withoutVersion} sem versão registrada (não entram na conta)</span>}
            </p>
            <p className="text-xs text-muted-foreground">
              Detalhe por versão em <Link href="/dashboard/versions" className="underline">Versões do App</Link>.
            </p>
          </div>

          {forceCount > 0 && (
            <div className="flex items-start gap-2 rounded-lg px-4 py-3 text-sm bg-rose-500/10 text-rose-700 border border-rose-500/30">
              <TriangleAlert className="h-4 w-4 mt-0.5 shrink-0" />
              Com essa versão mínima, {forceCount} usuários ficarão sem acesso ao app até atualizar. Confirme que a versão está disponível na App Store e no Google Play.
            </div>
          )}

          {feedback && (
            <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${feedback.ok ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/30" : "bg-rose-500/10 text-rose-700 border border-rose-500/30"}`}>
              {feedback.ok ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
              {feedback.msg}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            {lastUpdated ? (
              <p className="text-xs text-muted-foreground">
                Última atualização: {new Date(lastUpdated).toLocaleString("pt-BR")}{lastUpdatedBy ? ` por ${lastUpdatedBy}` : ""}
              </p>
            ) : <span className="text-xs text-muted-foreground">Ainda não configurado: o app não mostra nenhum aviso.</span>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
