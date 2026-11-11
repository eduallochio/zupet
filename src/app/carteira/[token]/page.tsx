import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { formatAppDate, parseAppDate } from "@/lib/dates";
import SpeciesIcon from "@/components/SpeciesIcon";

export const metadata: Metadata = {
  title: "Carteira de Saúde — Zupet",
  robots: { index: false, follow: false }, // link pessoal e temporário: nunca deve ser indexado
};

const UUID_OR_TOKEN = /^[0-9a-f-]{36}$/i;

const SPECIES_LABELS: Record<string, string> = { dog: "Cachorro", cat: "Gato", other: "Outro" };
const GENDER_LABELS: Record<string, string> = { male: "Macho", female: "Fêmea" };

function translateSpecies(species: string | null): string {
  if (!species) return "";
  return SPECIES_LABELS[species.toLowerCase()] ?? species;
}

function translateGender(gender: string | null): string {
  if (!gender) return "";
  return GENDER_LABELS[gender.toLowerCase()] ?? gender;
}

async function getShareData(token: string) {
  if (!UUID_OR_TOKEN.test(token)) return null;

  // get_pet_share_link() só devolve o pet_id se o token existir, não estiver
  // revogado e não tiver expirado — ver migration_v75_pet_share_links.sql.
  const { data: linkRows } = await supabaseAdmin.rpc("get_pet_share_link", { p_token: token });
  const petId = linkRows?.[0]?.pet_id as string | undefined;
  if (!petId) return null;

  const [petRes, vaccRes, medRes, weightRes, emergRes] = await Promise.all([
    supabaseAdmin.from("pets").select("id, name, species, breed, dob, gender, castrated, microchip, weight, food_allergies, med_allergies, restrictions").eq("id", petId).maybeSingle(),
    supabaseAdmin.from("vaccinations").select("vaccine_name, date_administered, next_due_date").eq("pet_id", petId).order("date_administered", { ascending: false }),
    supabaseAdmin.from("pet_medications").select("name, dosage, frequency, active, vet").eq("pet_id", petId).order("created_at", { ascending: false }),
    supabaseAdmin.from("weight_records").select("weight, date").eq("pet_id", petId).order("date", { ascending: false }).limit(5),
    supabaseAdmin.from("emergency_contacts").select("type, name, phone").eq("pet_id", petId),
  ]);

  const pet = petRes.data;
  if (!pet) return null;

  return {
    pet,
    vaccines: vaccRes.data ?? [],
    medications: medRes.data ?? [],
    weights: weightRes.data ?? [],
    emergencyContacts: emergRes.data ?? [],
  };
}

function isOverdue(nextDueDate: string | null): boolean {
  const d = parseAppDate(nextDueDate);
  return !!d && d.getTime() < Date.now();
}

export default async function CarteiraPublicaPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getShareData(token);

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-sm text-center">
          <p className="text-4xl mb-3">🔒</p>
          <h1 className="text-lg font-semibold text-slate-800">Este link não está mais disponível</h1>
          <p className="mt-2 text-sm text-slate-500">
            Ele pode ter expirado ou sido revogado pelo tutor. Peça um novo link para acessar a carteira de saúde atualizada.
          </p>
        </div>
      </main>
    );
  }

  const { pet, vaccines, medications, weights, emergencyContacts } = data;
  const activeMeds = medications.filter((m) => m.active);
  const hasAllergies = (pet.food_allergies?.length ?? 0) > 0 || (pet.med_allergies?.length ?? 0) > 0 || !!pet.restrictions;
  const overdueVaccines = vaccines.filter((v) => isOverdue(v.next_due_date));
  // weight_records é o histórico; alguns pets (ex.: cadastrados pelo app walker) só têm o peso solto em pets.weight
  const currentWeight = weights[0]?.weight ?? pet.weight ?? null;

  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      {/* Hero */}
      <div className="bg-gradient-to-b from-teal-600 to-teal-700 px-5 py-6 text-white">
        <p className="mb-3 text-xs font-semibold tracking-wide text-teal-100">🐾 ZUPET · CARTEIRA DE SAÚDE</p>
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <SpeciesIcon species={pet.species ?? ""} size={36} />
          </div>
          <div>
            <h1 className="text-xl font-bold">{pet.name}</h1>
            <p className="text-sm text-teal-100">{[translateSpecies(pet.species), pet.breed, translateGender(pet.gender)].filter(Boolean).join(" · ")}</p>
          </div>
        </div>
      </div>

      {/* Alertas */}
      <div className="flex flex-wrap gap-2 bg-white px-5 py-3 shadow-sm">
        {overdueVaccines.length === 0 && !hasAllergies && activeMeds.length === 0 ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">✅ Nenhuma pendência de saúde no momento</span>
        ) : (
          <>
            {overdueVaccines.length > 0 && (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                ⚠️ {overdueVaccines.length} vacina{overdueVaccines.length > 1 ? "s" : ""} vencida{overdueVaccines.length > 1 ? "s" : ""}
              </span>
            )}
            {hasAllergies && (
              <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">⚠️ Alergias cadastradas</span>
            )}
            {activeMeds.length > 0 && (
              <span className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700">
                💊 {activeMeds.length} medicamento{activeMeds.length > 1 ? "s" : ""} ativo{activeMeds.length > 1 ? "s" : ""}
              </span>
            )}
          </>
        )}
      </div>

      <div className="mx-auto max-w-lg space-y-3 px-4 pt-4">
        {/* Informações */}
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-800">Informações</h2>
          <dl className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Nascimento", value: formatAppDate(pet.dob) },
              { label: "Peso", value: currentWeight !== null ? `${currentWeight} kg` : "—" },
              { label: "Castrado", value: pet.castrated === true ? "Sim" : pet.castrated === false ? "Não" : "—" },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{item.label}</dt>
                <dd className="text-sm font-semibold text-slate-800">{item.value}</dd>
              </div>
            ))}
          </dl>
          {hasAllergies && (
            <div className="mt-3 rounded-lg border-l-4 border-amber-400 bg-amber-50 p-3 text-xs text-slate-700">
              {(pet.food_allergies?.length ?? 0) > 0 && <p><strong>Alergias alimentares:</strong> {pet.food_allergies!.join(", ")}</p>}
              {(pet.med_allergies?.length ?? 0) > 0 && <p><strong>Alergias a medicamentos:</strong> {pet.med_allergies!.join(", ")}</p>}
              {pet.restrictions && <p><strong>Observações:</strong> {pet.restrictions}</p>}
            </div>
          )}
        </section>

        {/* Vacinas */}
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-800">💉 Vacinas</h2>
          {vaccines.length === 0 ? (
            <p className="py-2 text-center text-xs text-slate-400">Nenhuma vacina registrada</p>
          ) : (
            <ul className="space-y-2">
              {vaccines.map((v, i) => {
                const overdue = isOverdue(v.next_due_date);
                return (
                  <li key={i} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{v.vaccine_name}</p>
                      <p className="text-xs text-slate-500">
                        Aplicada em {formatAppDate(v.date_administered)}
                        {v.next_due_date && ` · Reforço: ${formatAppDate(v.next_due_date)}`}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${overdue ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {overdue ? "Vencida" : "Em dia"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Medicamentos */}
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-800">💊 Medicamentos</h2>
          {medications.length === 0 ? (
            <p className="py-2 text-center text-xs text-slate-400">Nenhum medicamento registrado</p>
          ) : (
            <ul className="space-y-2">
              {medications.map((m, i) => (
                <li key={i} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className={`text-sm font-medium ${m.active ? "text-slate-800" : "text-slate-400"}`}>{m.name}</p>
                    <p className="text-xs text-slate-500">{[m.dosage, m.frequency].filter(Boolean).join(" · ")}</p>
                    {m.vet && <p className="text-[11px] text-slate-400">Dr(a). {m.vet}</p>}
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${m.active ? "bg-pink-100 text-pink-700" : "bg-slate-100 text-slate-500"}`}>
                    {m.active ? "Ativo" : "Concluído"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Peso */}
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-800">⚖️ Histórico de Peso</h2>
          {weights.length === 0 ? (
            pet.weight !== null ? (
              <ul className="space-y-1">
                <li className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Peso cadastrado</span>
                  <span className="font-semibold text-slate-800">{pet.weight} kg</span>
                </li>
              </ul>
            ) : (
              <p className="py-2 text-center text-xs text-slate-400">Nenhum peso registrado</p>
            )
          ) : (
            <ul className="space-y-1">
              {weights.map((w, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{formatAppDate(w.date)}</span>
                  <span className="font-semibold text-slate-800">{w.weight} kg</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Emergência */}
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-800">🚨 Contatos de Emergência</h2>
          {emergencyContacts.length === 0 ? (
            <p className="py-2 text-center text-xs text-slate-400">Nenhum contato registrado</p>
          ) : (
            <ul className="space-y-2">
              {emergencyContacts.map((c, i) => (
                <li key={i} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.phone}</p>
                  </div>
                  <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-700">
                    {c.type === "emergency" ? "Emergência" : c.type === "vet" ? "Veterinário" : "Clínica"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="mx-auto mt-6 max-w-lg px-5 text-center text-[11px] text-slate-400">
        Link temporário gerado pelo tutor no app Zupet. Nenhum cadastro necessário para visualizar.
      </p>
    </main>
  );
}
