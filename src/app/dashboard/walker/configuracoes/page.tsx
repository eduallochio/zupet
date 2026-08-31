import { supabaseAdmin } from "@/lib/supabase-admin";
import ConfiguracoesClient from "./ConfiguracoesClient";

export const revalidate = 0;

export default async function ConfiguracoesPage() {
  const { data } = await supabaseAdmin
    .from("app_config")
    .select("key, value, updated_at, updated_by")
    .eq("key", "walker_pro_plan")
    .maybeSingle();

  const config = data?.value ?? {
    price_full: 79.9,
    price_promo: 49.9,
    promo_active: true,
    promo_label: "Tempo limitado",
    currency: "BRL",
  };

  return (
    <ConfiguracoesClient
      config={config as {
        price_full: number;
        price_promo: number;
        promo_active: boolean;
        promo_label: string;
        currency: string;
      }}
      lastUpdated={data?.updated_at ?? null}
      lastUpdatedBy={data?.updated_by ?? null}
    />
  );
}
