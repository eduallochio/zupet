import { supabaseAdmin } from "@/lib/supabase-admin";
import AvaliacoesClient from "./AvaliacoesClient";

export const revalidate = 60;

async function getAvaliacoes() {
  const [{ data: ratings }, { data: walkers }] = await Promise.all([
    supabaseAdmin
      .from("walker_ratings")
      .select("id, walker_id, owner_id, session_id, rating, comment, created_at")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("walker_profiles")
      .select("id, name"),
  ]);

  const walkerMap: Record<string, string> = {};
  for (const w of walkers ?? []) {
    walkerMap[w.id] = w.name ?? "—";
  }

  const allRatings = ratings ?? [];
  const totalReviews = allRatings.length;
  const avgRating =
    totalReviews > 0
      ? Math.round((allRatings.reduce((sum, r) => sum + (r.rating ?? 0), 0) / totalReviews) * 10) / 10
      : 0;

  const positiveReviews = allRatings.filter((r) => (r.rating ?? 0) >= 4).length;
  const negativeReviews = allRatings.filter((r) => (r.rating ?? 0) <= 2).length;

  const rating5 = allRatings.filter((r) => r.rating === 5).length;
  const rating4 = allRatings.filter((r) => r.rating === 4).length;
  const rating3 = allRatings.filter((r) => r.rating === 3).length;
  const rating2 = allRatings.filter((r) => r.rating === 2).length;
  const rating1 = allRatings.filter((r) => r.rating === 1).length;

  const recentReviews = allRatings.slice(0, 20).map((r) => ({
    id: r.id,
    walkerId: r.walker_id,
    walkerName: walkerMap[r.walker_id] ?? "—",
    rating: r.rating ?? 0,
    comment: r.comment ?? null,
    createdAt: r.created_at,
  }));

  return {
    totalReviews,
    avgRating,
    positiveReviews,
    negativeReviews,
    rating5,
    rating4,
    rating3,
    rating2,
    rating1,
    recentReviews,
  };
}

export default async function AvaliacoesPage() {
  const data = await getAvaliacoes();
  return <AvaliacoesClient data={data} />;
}
