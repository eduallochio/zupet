import { supabaseAdmin } from "@/lib/supabase-admin";
import PetsClient from "./PetsClient";

export const revalidate = 60; // ISR: regenera a página a cada 60 segundos

function calcAge(dob: string | null): string {
  if (!dob) return "—";
  let birth: Date;
  if (dob.includes("/")) {
    const [d, m, y] = dob.split("/");
    birth = new Date(`${y}-${m}-${d}`);
  } else {
    birth = new Date(dob);
  }
  if (isNaN(birth.getTime())) return "—";
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 1) return "< 1m";
  if (months < 12) return `${months}m`;
  return `${Math.floor(months / 12)}a`;
}

function speciesEmoji(s: string): string {
  const l = s.toLowerCase();
  if (l.includes("cachorro") || l.includes("dog")) return "🐶";
  if (l.includes("gato") || l.includes("cat")) return "🐱";
  if (l.includes("ssaro") || l.includes("bird")) return "🐦";
  if (l.includes("coelho")) return "🐰";
  if (l.includes("peixe")) return "🐠";
  return "🐾";
}

async function getPets() {
  const [{ data: pets }, { data: profiles }] = await Promise.all([
    supabaseAdmin.from("pets").select("id, user_id, name, species, breed, dob, gender, castrated, created_at").order("created_at", { ascending: false }),
    supabaseAdmin.from("user_profiles").select("user_id, name"),
  ]);

  const profileMap: Record<string, string> = {};
  for (const p of profiles ?? []) profileMap[p.user_id] = p.name ?? "";

  const speciesMap: Record<string, number> = {};
  for (const p of pets ?? []) {
    const s = p.species ?? "Outros";
    speciesMap[s] = (speciesMap[s] ?? 0) + 1;
  }

  return {
    pets: (pets ?? []).map((p) => ({
      id: p.id,
      name: p.name ?? "—",
      species: p.species ?? "—",
      breed: p.breed ?? "—",
      age: calcAge(p.dob),
      gender: p.gender ?? "—",
      castrated: p.castrated ?? false,
      owner: profileMap[p.user_id] ?? "—",
      ownerId: p.user_id as string,
      emoji: speciesEmoji(p.species ?? ""),
      createdAt: p.created_at,
    })),
    speciesData: Object.entries(speciesMap).map(([name, value]) => ({ name, value })),
  };
}

export default async function PetsPage({ searchParams }: { searchParams: Promise<{ species?: string }> }) {
  const [data, { species }] = await Promise.all([getPets(), searchParams]);
  return <PetsClient pets={data.pets} speciesData={data.speciesData} initialSpecies={species} />;
}
