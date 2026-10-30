import { supabaseAdmin } from "@/lib/supabase-admin";
import WeightClient from "./WeightClient";

export const revalidate = 60;

async function getWeightRecords() {
  const [{ data: records }, { data: profiles }, { data: pets }] = await Promise.all([
    supabaseAdmin
      .from("weight_records")
      .select("id, user_id, pet_id, weight, date, note, created_at")
      .order("created_at", { ascending: false }),
    supabaseAdmin.from("user_profiles").select("user_id, name"),
    supabaseAdmin.from("pets").select("id, name, species"),
  ]);

  const profileMap: Record<string, string> = {};
  for (const p of profiles ?? []) profileMap[p.user_id] = p.name ?? "—";

  const petMap: Record<string, { name: string; species: string }> = {};
  for (const p of pets ?? []) petMap[p.id] = { name: p.name ?? "—", species: p.species ?? "—" };

  const weights = (records ?? []).map((r) => r.weight as number).filter(Boolean);
  const avgWeight = weights.length > 0 ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1) : "—";

  return {
    records: (records ?? []).map((r) => ({
      id: r.id,
      weight: r.weight,
      date: r.date,
      note: r.note,
      owner: profileMap[r.user_id] ?? "—",
      petName: petMap[r.pet_id]?.name ?? "—",
      petSpecies: petMap[r.pet_id]?.species ?? "—",
      createdAt: r.created_at,
    })),
    avgWeight,
  };
}

export default async function WeightPage() {
  const data = await getWeightRecords();
  return <WeightClient records={data.records} avgWeight={data.avgWeight} />;
}
