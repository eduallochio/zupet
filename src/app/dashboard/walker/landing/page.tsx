import { createClient } from "@supabase/supabase-js";
import { WalkerLandingClient } from "./WalkerLandingClient";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type WalkerLead = {
  id: string;
  name: string;
  phone: string;
  instagram: string | null;
  created_at: string;
};

export default async function WalkerLandingPage() {
  const { data: leads } = await adminClient()
    .from("walker_leads")
    .select("id, name, phone, instagram, created_at")
    .order("created_at", { ascending: false });

  return <WalkerLandingClient leads={(leads ?? []) as WalkerLead[]} />;
}
