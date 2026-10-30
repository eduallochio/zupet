import { supabaseAdmin } from "@/lib/supabase-admin";
import RemindersClient from "./RemindersClient";

export const revalidate = 60;

async function getReminders() {
  const [{ data: reminders }, { data: profiles }, { data: pets }] = await Promise.all([
    supabaseAdmin
      .from("reminders")
      .select("id, user_id, pet_id, category, description, date, recurrence, completed, completed_at, medication_dose, notes, created_at")
      .order("created_at", { ascending: false }),
    supabaseAdmin.from("user_profiles").select("user_id, name"),
    supabaseAdmin.from("pets").select("id, name"),
  ]);

  const profileMap: Record<string, string> = {};
  for (const p of profiles ?? []) profileMap[p.user_id] = p.name ?? "—";

  const petMap: Record<string, string> = {};
  for (const p of pets ?? []) petMap[p.id] = p.name ?? "—";

  const categoryCount: Record<string, number> = {};
  for (const r of reminders ?? []) {
    const cat = r.category ?? "Outro";
    categoryCount[cat] = (categoryCount[cat] ?? 0) + 1;
  }

  return {
    reminders: (reminders ?? []).map((r) => ({
      id: r.id,
      category: r.category ?? "—",
      description: r.description ?? "—",
      date: r.date,
      recurrence: r.recurrence ?? "once",
      completed: r.completed ?? false,
      completedAt: r.completed_at,
      medicationDose: r.medication_dose,
      notes: r.notes,
      owner: profileMap[r.user_id] ?? "—",
      petName: petMap[r.pet_id] ?? "—",
      createdAt: r.created_at,
    })),
    categoryData: Object.entries(categoryCount).map(([name, value]) => ({ name, value })),
  };
}

export default async function RemindersPage() {
  const data = await getReminders();
  return <RemindersClient reminders={data.reminders} categoryData={data.categoryData} />;
}
