import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { formatAppDate } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Tabelas do app com registros por usuário (todas têm user_id)
const RECORD_TABLES: { table: string; label: string }[] = [
  { table: "vaccinations", label: "Vacinas" },
  { table: "reminders", label: "Lembretes" },
  { table: "weight_records", label: "Pesos" },
  { table: "pet_diary", label: "Diário" },
  { table: "pet_medications", label: "Medicamentos" },
  { table: "pet_prescriptions", label: "Prescrições" },
  { table: "pet_documents", label: "Documentos" },
  { table: "pet_photos", label: "Fotos" },
  { table: "pet_costs", label: "Custos" },
  { table: "pet_feedings", label: "Alimentação" },
  { table: "emergency_contacts", label: "Contatos de emergência" },
];

const fmtDateTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm font-medium break-words">{children}</div>
    </div>
  );
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const { data: authData } = await supabaseAdmin.auth.admin.getUserById(id);
  const authUser = authData?.user;
  if (!authUser) notFound();

  const [profileRes, petsRes, walkerRes, errorsRes, identitiesRes, ...counts] = await Promise.all([
    supabaseAdmin
      .from("user_profiles")
      .select("name, city, state, country, platform, app_version, updated_at, expo_push_token, fcm_token, push_notifications_enabled")
      .eq("user_id", id)
      .maybeSingle(),
    supabaseAdmin.from("pets").select("id, name, species, breed, dob, gender, created_at").eq("user_id", id).order("created_at", { ascending: true }),
    supabaseAdmin.from("walker_profiles").select("user_id").eq("user_id", id).maybeSingle(),
    supabaseAdmin
      .from("app_errors")
      .select("id, error_type, message, screen, app_version, resolved, created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabaseAdmin.from("identities").select("provider").eq("user_id", id),
    ...RECORD_TABLES.map((t) => supabaseAdmin.from(t.table).select("*", { count: "exact", head: true }).eq("user_id", id)),
  ]);

  const profile = profileRes.data;
  const pets = petsRes.data ?? [];
  const errors = errorsRes.data ?? [];
  const providers = (identitiesRes.data ?? []).map((i) => i.provider);
  const name = profile?.name ?? authUser.user_metadata?.name ?? authUser.user_metadata?.full_name ?? "—";
  const hasToken = !!profile?.expo_push_token || !!profile?.fcm_token;
  const pushLabel = profile?.push_notifications_enabled === false ? "Desativado pelo usuário" : hasToken ? "Recebe push" : "Sem token registrado";
  const location = [profile?.city, profile?.state, profile?.country].filter(Boolean).join(", ") || "—";

  return (
    <div className="space-y-6">
      <Link href="/dashboard/users" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Usuários
      </Link>

      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="font-heading text-3xl font-bold">{name}</h1>
          {walkerRes.data && <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/30 hover:bg-amber-500/10">Walker</Badge>}
          {providers.includes("google") && <Badge variant="outline">Google</Badge>}
          {providers.includes("apple") && <Badge variant="outline">Apple</Badge>}
          {providers.includes("email") && <Badge variant="outline">E-mail</Badge>}
        </div>
        <p className="text-muted-foreground text-sm mt-1">{authUser.email ?? "—"}</p>
        <p className="text-muted-foreground text-xs font-mono mt-0.5">{id}</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Conta e dispositivo</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Cadastro">{fmtDateTime(authUser.created_at)}</Field>
          <Field label="Último login">{fmtDateTime(authUser.last_sign_in_at)}</Field>
          <Field label="Perfil atualizado em">{fmtDateTime(profile?.updated_at)}</Field>
          <Field label="Localização">{location}</Field>
          <Field label="Plataforma">{profile?.platform === "ios" ? "iOS" : profile?.platform === "android" ? "Android" : "—"}</Field>
          <Field label="Versão do app">{profile?.app_version ? <span className="font-mono">v{profile.app_version}</span> : "—"}</Field>
          <Field label="Notificações push">{pushLabel}</Field>
          <Field label="Tokens">
            {[profile?.expo_push_token && "Expo", profile?.fcm_token && "FCM"].filter(Boolean).join(" + ") || "nenhum"}
          </Field>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card><CardContent className="pt-5">
          <p className="text-2xl font-heading font-bold">{pets.length}</p>
          <p className="text-xs text-muted-foreground">Pets</p>
        </CardContent></Card>
        {RECORD_TABLES.map((t, i) => (
          <Card key={t.table}><CardContent className="pt-5">
            <p className="text-2xl font-heading font-bold">{counts[i]?.count ?? 0}</p>
            <p className="text-xs text-muted-foreground">{t.label}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Pets</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Nome</TableHead>
                <TableHead>Espécie / Raça</TableHead>
                <TableHead>Gênero</TableHead>
                <TableHead>Nascimento</TableHead>
                <TableHead className="pr-6">Cadastrado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pets.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10 text-sm">Nenhum pet cadastrado</TableCell></TableRow>
              ) : pets.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="pl-6 text-sm font-medium">{p.name ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{[p.species, p.breed].filter(Boolean).join(" · ") || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground capitalize">{p.gender ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatAppDate(p.dob)}</TableCell>
                  <TableCell className="pr-6 text-sm text-muted-foreground">{p.created_at ? new Date(p.created_at).toLocaleDateString("pt-BR") : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Últimos erros do app</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {errors.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nenhum erro registrado para este usuário</p>
          ) : errors.map((e) => (
            <div key={e.id} className={`border rounded-lg p-3 space-y-1 ${e.resolved ? "opacity-60" : ""}`}>
              <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
                <Badge variant="outline" className="text-[10px]">{e.error_type}</Badge>
                {e.app_version && <span className="font-mono">v{e.app_version}</span>}
                {e.screen && <span>tela: <span className="font-mono">{e.screen}</span></span>}
                <span className="ml-auto">{fmtDateTime(e.created_at)}</span>
                {e.resolved && <Badge className="text-[10px] bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10">Resolvido</Badge>}
              </div>
              <p className="text-sm break-words">{e.message}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
