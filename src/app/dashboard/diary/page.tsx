import { supabaseAdmin } from "@/lib/supabase-admin";
import DiaryClient from "./DiaryClient";

export const revalidate = 60;

async function getDiaryEntries() {
  const [{ data: entries }, { data: profiles }, { data: pets }] = await Promise.all([
    supabaseAdmin
      .from("pet_diary")
      .select("id, user_id, pet_id, date, mood, notes, created_at")
      .order("created_at", { ascending: false }), // `date` é texto dd/mm/aaaa: ordenar por ele embaralha os meses
    supabaseAdmin.from("user_profiles").select("user_id, name"),
    supabaseAdmin.from("pets").select("id, name, species"),
  ]);

  const profileMap: Record<string, string> = {};
  for (const p of profiles ?? []) profileMap[p.user_id] = p.name ?? "—";

  const petMap: Record<string, { name: string; species: string }> = {};
  for (const p of pets ?? []) petMap[p.id] = { name: p.name ?? "—", species: p.species ?? "—" };

  const moodCount: Record<string, number> = {};
  for (const e of entries ?? []) {
    const m = e.mood ?? "neutral";
    moodCount[m] = (moodCount[m] ?? 0) + 1;
  }

  return {
    entries: (entries ?? []).map((e) => ({
      id: e.id,
      date: e.date,
      mood: e.mood ?? "neutral",
      notes: e.notes ?? "",
      owner: profileMap[e.user_id] ?? "—",
      petName: petMap[e.pet_id]?.name ?? "—",
      petSpecies: petMap[e.pet_id]?.species ?? "—",
      createdAt: e.created_at,
    })),
    moodCount,
  };
}

export default async function DiaryPage() {
  const data = await getDiaryEntries();
  return <DiaryClient entries={data.entries} moodCount={data.moodCount} />;
}
