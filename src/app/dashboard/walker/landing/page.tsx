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

export type TrackingStats = {
  totalViews: number;
  viewsLast30: number;
  mobileViews: number;
  desktopViews: number;
  androidClicks: number;
  iosClicks: number;
};

export default async function WalkerLandingPage() {
  const db = adminClient();

  const [
    { data: leads },
    { count: totalViews },
    { count: viewsLast30 },
    { data: deviceBreakdown },
    { data: storeClicks },
  ] = await Promise.all([
    db.from("walker_leads")
      .select("id, name, phone, instagram, created_at")
      .order("created_at", { ascending: false }),
    db.from("page_views").select("*", { count: "exact", head: true }),
    db.from("page_views")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    db.from("page_views").select("device"),
    db.from("store_clicks").select("store"),
  ]);

  const devices = (deviceBreakdown ?? []) as { device: string }[];
  const clicks = (storeClicks ?? []) as { store: string }[];

  const stats: TrackingStats = {
    totalViews: totalViews ?? 0,
    viewsLast30: viewsLast30 ?? 0,
    mobileViews: devices.filter((d) => d.device === "mobile" || d.device === "tablet").length,
    desktopViews: devices.filter((d) => d.device === "desktop").length,
    androidClicks: clicks.filter((c) => c.store === "android").length,
    iosClicks: clicks.filter((c) => c.store === "ios").length,
  };

  return (
    <WalkerLandingClient
      leads={(leads ?? []) as WalkerLead[]}
      stats={stats}
    />
  );
}
