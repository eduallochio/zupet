import { supabaseAdmin } from "@/lib/supabase-admin";
import AnalyticsClient from "./AnalyticsClient";

export const revalidate = 60; // ISR: regenera a página a cada 60 segundos

function monthLabel(date: Date) {
  return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

function parseDob(dob: string): Date | null {
  if (!dob) return null;
  const parts = dob.split("/");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  const date = new Date(`${y}-${m}-${d}`);
  return isNaN(date.getTime()) ? null : date;
}

async function getAnalytics() {
  const [
    { data: pets },
    { data: profiles },
    { data: photos },
    { data: deletions },
    { data: achievements },
    { data: { users: authUsers } },
  ] = await Promise.all([
    supabaseAdmin.from("pets").select("id, user_id, species, gender, castrated, dob, microchip, food_allergies, med_allergies, restrictions, created_at"),
    supabaseAdmin.from("user_profiles").select("user_id, city, state, birth_date, experience, name, platform, updated_at, country, country_code"),
    supabaseAdmin.from("pet_photos").select("id, pet_id, created_at"),
    supabaseAdmin.from("pet_deletions").select("id, pet_name, pet_species, reason, is_memorial, deleted_at").order("deleted_at", { ascending: false }),
    supabaseAdmin.from("user_achievements").select("user_id, achievement_id, unlocked_at"),
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const now = new Date();
  const allPets = pets ?? [];
  const allProfiles = profiles ?? [];
  const allAchievements = achievements ?? [];
  const allDeletions = deletions ?? [];
  const allPhotos = photos ?? [];

  // ── Crescimento acumulado de usuários (12 meses) ──────────────────────────
  const userGrowthMap: Record<string, number> = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    userGrowthMap[monthLabel(d)] = 0;
  }
  for (const u of authUsers) {
    const label = monthLabel(new Date(u.created_at));
    if (label in userGrowthMap) userGrowthMap[label]++;
  }
  let acc = 0;
  const userGrowthData = Object.entries(userGrowthMap).map(([month, novos]) => {
    acc += novos;
    return { month, Novos: novos, Total: acc };
  });

  // MoM growth (mês atual vs anterior)
  const lastTwo = userGrowthData.slice(-2);
  const momGrowth = lastTwo.length === 2 && lastTwo[0].Novos > 0
    ? Math.round(((lastTwo[1].Novos - lastTwo[0].Novos) / lastTwo[0].Novos) * 100)
    : null;
  const newThisMonth = userGrowthData[userGrowthData.length - 1]?.Novos ?? 0;

  // ── Cadastros de pets por mês (6 meses) ───────────────────────────────────
  const petMonthMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    petMonthMap[monthLabel(d)] = 0;
  }
  for (const p of allPets) {
    const label = monthLabel(new Date(p.created_at));
    if (label in petMonthMap) petMonthMap[label]++;
  }
  const petMonthData = Object.entries(petMonthMap).map(([month, Pets]) => ({ month, Pets }));

  // ── Fotos por mês (6 meses) ───────────────────────────────────────────────
  const photoMonthMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    photoMonthMap[monthLabel(d)] = 0;
  }
  for (const ph of allPhotos) {
    const label = monthLabel(new Date(ph.created_at));
    if (label in photoMonthMap) photoMonthMap[label]++;
  }
  const photoMonthData = Object.entries(photoMonthMap).map(([month, Fotos]) => ({ month, Fotos }));

  // ── Espécies ──────────────────────────────────────────────────────────────
  const speciesMap: Record<string, number> = {};
  for (const p of allPets) {
    const s = p.species ?? "Outros";
    speciesMap[s] = (speciesMap[s] ?? 0) + 1;
  }
  const speciesData = Object.entries(speciesMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // ── Castração por espécie ─────────────────────────────────────────────────
  const castrationBySpecies: Record<string, { total: number; castrated: number }> = {};
  for (const p of allPets) {
    const s = p.species ?? "Outros";
    if (!castrationBySpecies[s]) castrationBySpecies[s] = { total: 0, castrated: 0 };
    castrationBySpecies[s].total++;
    if (p.castrated) castrationBySpecies[s].castrated++;
  }
  const castrationData = Object.entries(castrationBySpecies)
    .map(([species, { total, castrated }]) => ({
      species,
      total,
      castrated,
      pct: total > 0 ? Math.round((castrated / total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // ── Gênero dos pets ───────────────────────────────────────────────────────
  const genderMap: Record<string, number> = { Macho: 0, Fêmea: 0, "Não informado": 0 };
  for (const p of allPets) {
    const g = (p.gender ?? "").toLowerCase();
    if (g === "macho" || g === "male") genderMap["Macho"]++;
    else if (g === "fêmea" || g === "femea" || g === "female") genderMap["Fêmea"]++;
    else genderMap["Não informado"]++;
  }
  const genderData = Object.entries(genderMap)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  // ── Castrados (total) ─────────────────────────────────────────────────────
  const castrated = allPets.filter((p) => p.castrated).length;
  const notCastrated = allPets.length - castrated;

  // ── Localização (estado/cidade, BR) ──────────────────────────────────────
  const locationMap: Record<string, number> = {};
  for (const p of allProfiles) {
    const loc = p.state ?? p.city ?? "Não informado";
    locationMap[loc] = (locationMap[loc] ?? 0) + 1;
  }
  const locationData = Object.entries(locationMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // ── Distribuição por país ─────────────────────────────────────────────────
  const countryMap: Record<string, { name: string; flag: string; count: number }> = {};
  const FLAG_MAP: Record<string, string> = {
    BR: "🇧🇷", US: "🇺🇸", PT: "🇵🇹", AR: "🇦🇷", MX: "🇲🇽",
    CO: "🇨🇴", CL: "🇨🇱", UY: "🇺🇾", PE: "🇵🇪", GB: "🇬🇧",
    ES: "🇪🇸", DE: "🇩🇪", FR: "🇫🇷", IT: "🇮🇹", CA: "🇨🇦",
    AU: "🇦🇺", JP: "🇯🇵",
  };
  for (const p of allProfiles) {
    if (!p.country_code) continue;
    const code = p.country_code.toUpperCase();
    if (!countryMap[code]) {
      countryMap[code] = { name: p.country ?? code, flag: FLAG_MAP[code] ?? "🌍", count: 0 };
    }
    countryMap[code].count++;
  }
  const countryData = Object.entries(countryMap)
    .map(([code, { name, flag, count }]) => ({ code, name, flag, count }))
    .sort((a, b) => b.count - a.count);

  const totalWithCountry = countryData.reduce((s, c) => s + c.count, 0);
  const internationalUsers = countryData.filter(c => c.code !== "BR").reduce((s, c) => s + c.count, 0);
  const internationalRate = totalWithCountry > 0
    ? Math.round((internationalUsers / totalWithCountry) * 100)
    : 0;

  // ── Distribuição de plataforma ────────────────────────────────────────────
  const platformMap: Record<string, number> = { Android: 0, iOS: 0, "Não informado": 0 };
  for (const p of allProfiles) {
    if (p.platform === "android") platformMap["Android"]++;
    else if (p.platform === "ios") platformMap["iOS"]++;
    else platformMap["Não informado"]++;
  }
  const platformData = Object.entries(platformMap)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  // ── Conversão (usuários com pelo menos 1 pet) ─────────────────────────────
  const usersWithPets = new Set(allPets.map((p) => p.user_id)).size;
  const totalUsers = authUsers.length;
  const conversionRate = totalUsers > 0 ? Math.round((usersWithPets / totalUsers) * 100) : 0;

  // ── Média de pets por usuário ativo ───────────────────────────────────────
  const avgPetsPerUser = usersWithPets > 0
    ? Math.round((allPets.length / usersWithPets) * 10) / 10
    : 0;

  // ── Taxa de foto por pet ──────────────────────────────────────────────────
  const petsWithPhoto = new Set(allPhotos.map((ph) => ph.pet_id)).size;
  const photoRate = allPets.length > 0
    ? Math.round((petsWithPhoto / allPets.length) * 100)
    : 0;
  const totalPhotos = allPhotos.length;

  // ── Completude de perfil ──────────────────────────────────────────────────
  const profileComplete = allProfiles.filter(
    (p) => p.city && p.state && p.birth_date && p.experience
  ).length;
  const profileCompletenessRate = allProfiles.length > 0
    ? Math.round((profileComplete / allProfiles.length) * 100)
    : 0;

  // ── Saúde dos pets ────────────────────────────────────────────────────────
  const hasText = (v: unknown) => typeof v === "string" ? v.trim() !== "" : Array.isArray(v) ? v.length > 0 : Boolean(v);
  const withMicrochip = allPets.filter((p) => hasText(p.microchip)).length;
  const withAllergies = allPets.filter(
    (p) => hasText(p.food_allergies) || hasText(p.med_allergies) || hasText(p.restrictions)
  ).length;
  const microchipRate = allPets.length > 0 ? Math.round((withMicrochip / allPets.length) * 100) : 0;
  const allergyRate = allPets.length > 0 ? Math.round((withAllergies / allPets.length) * 100) : 0;

  // ── Idade média dos pets ──────────────────────────────────────────────────
  const nowMs = now.getTime();
  const petAges = allPets
    .map((p) => parseDob(p.dob))
    .filter((d): d is Date => d !== null)
    .map((d) => (nowMs - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25));

  const avgPetAgeYears = petAges.length > 0
    ? Math.round((petAges.reduce((a, b) => a + b, 0) / petAges.length) * 10) / 10
    : null;

  // Faixas etárias dos pets
  const ageBands = { "Filhote (< 1a)": 0, "Jovem (1–3a)": 0, "Adulto (3–8a)": 0, "Sênior (> 8a)": 0 };
  for (const age of petAges) {
    if (age < 1) ageBands["Filhote (< 1a)"]++;
    else if (age < 3) ageBands["Jovem (1–3a)"]++;
    else if (age < 8) ageBands["Adulto (3–8a)"]++;
    else ageBands["Sênior (> 8a)"]++;
  }
  const ageBandData = Object.entries(ageBands)
    .map(([name, value]) => ({ name, value }))
    .filter((b) => b.value > 0);

  // ── Experiência dos usuários ──────────────────────────────────────────────
  const experienceMap: Record<string, number> = {};
  for (const p of allProfiles) {
    const exp = p.experience ?? "Não informado";
    experienceMap[exp] = (experienceMap[exp] ?? 0) + 1;
  }
  const experienceData = Object.entries(experienceMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // ── Exclusões de pets ─────────────────────────────────────────────────────
  const REASON_LABELS: Record<string, string> = {
    wrong_data:  "Cadastro errado",
    passed_away: "Pet faleceu",
    rehomed:     "Doado / novo lar",
    duplicate:   "Duplicado",
    other:       "Outro motivo",
  };

  const deletionReasonMap: Record<string, number> = {};
  for (const d of allDeletions) {
    const label = REASON_LABELS[d.reason] ?? d.reason;
    deletionReasonMap[label] = (deletionReasonMap[label] ?? 0) + 1;
  }
  const deletionReasonData = Object.entries(deletionReasonMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const totalDeletions  = allDeletions.filter(d => !d.is_memorial).length;
  const totalMemorials  = allDeletions.filter(d => d.is_memorial).length;
  const recentDeletions = allDeletions.slice(0, 10).map(d => ({
    petName:   d.pet_name  ?? "—",
    petSpecies: d.pet_species ?? "—",
    reason:    REASON_LABELS[d.reason] ?? d.reason,
    isMemorial: d.is_memorial ?? false,
    deletedAt: d.deleted_at,
  }));

  // ── Conquistas ────────────────────────────────────────────────────────────────
  const ACHIEVEMENT_META: Record<string, { title: string; group: string }> = {
    first_pet:          { title: "Primeiro Amigo",      group: "Pets & Família" },
    three_pets:         { title: "Família Grande",      group: "Pets & Família" },
    five_pets:          { title: "Matilha",             group: "Pets & Família" },
    ten_pets:           { title: "Fazendeiro",          group: "Pets & Família" },
    breed_filled:       { title: "Especialista",        group: "Pets & Família" },
    photo_added:        { title: "Fotogênico",          group: "Pets & Família" },
    birthday_today:     { title: "Parabéns!",           group: "Pets & Família" },
    senior_pet:         { title: "Veterano",            group: "Pets & Família" },
    first_reminder:     { title: "Organizado",          group: "Lembretes" },
    five_reminders:     { title: "Super Tutor",         group: "Lembretes" },
    ten_reminders:      { title: "Agenda Cheia",        group: "Lembretes" },
    all_categories:     { title: "Completo",            group: "Lembretes" },
    recurring_reminder: { title: "Rotineiro",           group: "Lembretes" },
    health_reminder:    { title: "Médico Fiel",         group: "Lembretes" },
    hygiene_reminder:   { title: "Limpinho",            group: "Lembretes" },
    first_vaccine:      { title: "Vacinado!",           group: "Vacinas" },
    vaccine_up_to_date: { title: "Saúde em Dia",        group: "Vacinas" },
    ten_vaccines:       { title: "Imunizado",           group: "Vacinas" },
    next_dose:          { title: "Previdente",          group: "Vacinas" },
    all_pets_vaccinated:{ title: "Proteção Total",      group: "Vacinas" },
    streak_3:           { title: "Começando",           group: "Sequência" },
    streak_7:           { title: "Semana Perfeita",     group: "Sequência" },
    streak_30:          { title: "Mês Dedicado",        group: "Sequência" },
    streak_100:         { title: "Lenda",               group: "Sequência" },
    total_30_days:      { title: "Usuário Fiel",        group: "Sequência" },
    first_weight:       { title: "Primeira Pesagem",    group: "Peso & Saúde" },
    weight_history:     { title: "Histórico Saudável",  group: "Peso & Saúde" },
    weight_all_pets:    { title: "Controle Total",      group: "Peso & Saúde" },
    dedicated:          { title: "Tutor Dedicado",      group: "Peso & Saúde" },
    all_species:        { title: "Arca de Noé",         group: "Diversidade" },
    five_species:       { title: "Zoológico",           group: "Diversidade" },
    cat_and_dog:        { title: "Clássico",            group: "Diversidade" },
    exotic_pet:         { title: "Exótico",             group: "Diversidade" },
    master_tutor:       { title: "Tutor Master",        group: "Marcos Especiais" },
    completionist:      { title: "Perfeccionista",      group: "Marcos Especiais" },
  };

  const TOTAL_ACHIEVEMENTS = Object.keys(ACHIEVEMENT_META).length;

  // Total de unlocks e usuários com conquistas
  const totalAchievementsUnlocked = allAchievements.length;
  const usersWithAchievements = new Set(allAchievements.map(a => a.user_id)).size;
  const achievementEngagementRate = totalUsers > 0
    ? Math.round((usersWithAchievements / totalUsers) * 100)
    : 0;

  // Média de conquistas por usuário com pelo menos 1
  const avgAchievementsPerUser = usersWithAchievements > 0
    ? Math.round((totalAchievementsUnlocked / usersWithAchievements) * 10) / 10
    : 0;

  // Top conquistas mais desbloqueadas
  const achievementCountMap: Record<string, number> = {};
  for (const a of allAchievements) {
    achievementCountMap[a.achievement_id] = (achievementCountMap[a.achievement_id] ?? 0) + 1;
  }
  const topAchievementsData = Object.entries(achievementCountMap)
    .map(([id, count]) => ({
      id,
      title: ACHIEVEMENT_META[id]?.title ?? id,
      group: ACHIEVEMENT_META[id]?.group ?? "Outros",
      count,
      pct: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Conquistas raras (menos desbloqueadas, excluindo as não registradas ainda)
  const rareAchievementsData = Object.entries(achievementCountMap)
    .map(([id, count]) => ({
      id,
      title: ACHIEVEMENT_META[id]?.title ?? id,
      count,
      pct: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0,
    }))
    .sort((a, b) => a.count - b.count)
    .slice(0, 5);

  // Distribuição por grupo
  const achievementGroupMap: Record<string, number> = {};
  for (const a of allAchievements) {
    const group = ACHIEVEMENT_META[a.achievement_id]?.group ?? "Outros";
    achievementGroupMap[group] = (achievementGroupMap[group] ?? 0) + 1;
  }
  const achievementGroupData = Object.entries(achievementGroupMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Unlocks por mês (últimos 6 meses)
  const achievementMonthMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    achievementMonthMap[monthLabel(d)] = 0;
  }
  for (const a of allAchievements) {
    const label = monthLabel(new Date(a.unlocked_at));
    if (label in achievementMonthMap) achievementMonthMap[label]++;
  }
  const achievementMonthData = Object.entries(achievementMonthMap)
    .map(([month, Conquistas]) => ({ month, Conquistas }));

  // % de completistas (desbloquearam todas)
  const userAchievementCount: Record<string, number> = {};
  for (const a of allAchievements) {
    userAchievementCount[a.user_id] = (userAchievementCount[a.user_id] ?? 0) + 1;
  }
  const completionistCount = Object.values(userAchievementCount)
    .filter(c => c >= TOTAL_ACHIEVEMENTS).length;
  const completionistRate = totalUsers > 0
    ? Math.round((completionistCount / totalUsers) * 100)
    : 0;

  return {
    // KPIs principais
    totalUsers,
    totalPets: allPets.length,
    usersWithPets,
    conversionRate,
    newThisMonth,
    momGrowth,
    avgPetsPerUser,
    // Castração
    castrated,
    notCastrated,
    castrationData,
    // Gráficos de crescimento
    userGrowthData,
    petMonthData,
    photoMonthData,
    // Composição
    speciesData,
    genderData,
    ageBandData,
    avgPetAgeYears,
    // Saúde
    totalPhotos,
    photoRate,
    microchipRate,
    allergyRate,
    // Perfil
    profileCompletenessRate,
    experienceData,
    // Localização
    locationData,
    // País
    countryData,
    internationalUsers,
    internationalRate,
    totalWithCountry,
    // Plataforma
    platformData,
    // Exclusões
    deletionReasonData,
    totalDeletions,
    totalMemorials,
    recentDeletions,
    // Conquistas
    totalAchievementsUnlocked,
    usersWithAchievements,
    achievementEngagementRate,
    avgAchievementsPerUser,
    completionistRate,
    topAchievementsData,
    rareAchievementsData,
    achievementGroupData,
    achievementMonthData,
  };
}

export default async function AnalyticsPage() {
  const data = await getAnalytics();
  return <AnalyticsClient data={data} />;
}
