"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Tag, DollarSign, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type ProPlanConfig = {
  price_full: number;
  price_promo: number;
  promo_active: boolean;
  promo_label: string;
  currency: string;
};

type Props = {
  config: ProPlanConfig;
  lastUpdated: string | null;
  lastUpdatedBy: string | null;
};

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR");
}

export default function ConfiguracoesClient({ config, lastUpdated, lastUpdatedBy }: Props) {
  const [priceFull, setPriceFull] = useState(String(config.price_full));
  const [pricePromo, setPricePromo] = useState(String(config.price_promo));
  const [promoActive, setPromoActive] = useState(config.promo_active);
  const [promoLabel, setPromoLabel] = useState(config.promo_label);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  async function handleSave() {
    setFeedback(null);
    const full = parseFloat(priceFull.replace(",", "."));
    const promo = parseFloat(pricePromo.replace(",", "."));

    if (isNaN(full) || full <= 0) {
      setFeedback({ ok: false, msg: "Preço cheio inválido" });
      return;
    }
    if (isNaN(promo) || promo <= 0) {
      setFeedback({ ok: false, msg: "Preço promocional inválido" });
      return;
    }
    if (!promoLabel.trim()) {
      setFeedback({ ok: false, msg: "Texto do desconto não pode ser vazio" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/walker/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price_full: full,
          price_promo: promo,
          promo_active: promoActive,
          promo_label: promoLabel.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erro desconhecido");
      }

      setFeedback({ ok: true, msg: "Configuração salva com sucesso!" });
    } catch (e: unknown) {
      setFeedback({ ok: false, msg: e instanceof Error ? e.message : "Erro ao salvar" });
    } finally {
      setSaving(false);
    }
  }

  const fullNum = parseFloat(priceFull.replace(",", ".")) || 0;
  const promoNum = parseFloat(pricePromo.replace(",", ".")) || 0;
  const discountPct = fullNum > 0 ? Math.round((1 - promoNum / fullNum) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie os valores e promoções do plano Pro do Zupet Walker</p>
      </div>

      {/* Preview do plano */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Tag className="h-4 w-4 text-primary" />
            Preview — como aparece no app
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 flex-wrap">
            {promoActive && promoNum > 0 && fullNum > promoNum ? (
              <>
                <span className="text-muted-foreground line-through text-lg">{fmtBRL(fullNum)}</span>
                <span className="text-3xl font-heading font-bold text-primary">{fmtBRL(promoNum)}</span>
                <Badge className="bg-primary/15 text-primary border-primary/30 text-xs">{promoLabel || "Desconto"}</Badge>
              </>
            ) : (
              <span className="text-3xl font-heading font-bold">{fmtBRL(promoActive ? promoNum : fullNum)}</span>
            )}
            <span className="text-muted-foreground text-sm">/mês</span>
          </div>
          {promoActive && discountPct > 0 && (
            <p className="text-xs text-muted-foreground mt-2">Desconto de {discountPct}% em relação ao preço cheio</p>
          )}
        </CardContent>
      </Card>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4" />
            Plano Pro — Preços
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Preço cheio (R$)</label>
              <p className="text-xs text-muted-foreground">Preço original antes do desconto. Aparece riscado quando promoção está ativa.</p>
              <input
                type="text"
                inputMode="decimal"
                value={priceFull}
                onChange={(e) => setPriceFull(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="79.90"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Preço promocional (R$)</label>
              <p className="text-xs text-muted-foreground">Preço com desconto. É o valor que o walker vai pagar quando a promoção estiver ativa.</p>
              <input
                type="text"
                inputMode="decimal"
                value={pricePromo}
                onChange={(e) => setPricePromo(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="49.90"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Texto do desconto</label>
            <p className="text-xs text-muted-foreground">Badge exibida junto ao preço promocional (ex: "Tempo limitado", "Lançamento").</p>
            <input
              type="text"
              value={promoLabel}
              onChange={(e) => setPromoLabel(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Tempo limitado"
              maxLength={40}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium">Promoção ativa</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {promoActive
                  ? "O app exibe o preço promocional com o preço cheio riscado."
                  : "O app exibe somente o preço cheio, sem desconto."}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={promoActive}
              onClick={() => setPromoActive((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${promoActive ? "bg-primary" : "bg-secondary border border-border"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${promoActive ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>

          {feedback && (
            <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${feedback.ok ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/30" : "bg-rose-500/10 text-rose-700 border border-rose-500/30"}`}>
              {feedback.ok
                ? <CheckCircle className="h-4 w-4 flex-shrink-0" />
                : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
              {feedback.msg}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            {lastUpdated ? (
              <p className="text-xs text-muted-foreground">
                Última atualização: {fmtDate(lastUpdated)}{lastUpdatedBy ? ` por ${lastUpdatedBy}` : ""}
              </p>
            ) : <span />}

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Salvando..." : "Salvar configuração"}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Card explicativo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4" />
            Como funciona
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Os valores definidos aqui são salvos na tabela <code className="font-mono text-xs bg-muted px-1 rounded">app_config</code> com a chave <code className="font-mono text-xs bg-muted px-1 rounded">walker_pro_plan</code>.</p>
          <p>O app Zupet Walker lê esses valores ao abrir a tela de assinatura Pro. Se o campo <strong>Promoção ativa</strong> estiver ligado, o preço cheio aparece riscado e o preço promocional em destaque com a badge de desconto.</p>
          <p>Se a promoção estiver desligada, apenas o preço cheio é exibido sem nenhuma referência de desconto.</p>
        </CardContent>
      </Card>
    </div>
  );
}
