import { supabaseAdmin } from "@/lib/supabase-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const revalidate = 60;
import { Badge } from "@/components/ui/badge";
import { Activity, UserPlus, PawPrint, FileText, Utensils, Camera } from "lucide-react";

async function getActivity() {
  const [authResult, newPets, photos] =
    await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
      supabaseAdmin
        .from("pets")
        .select("id, name, species, user_id, created_at")
        .order("created_at", { ascending: false })
        .limit(15),
      supabaseAdmin
        .from("pet_photos")
        .select("id, pet_id, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);
  const newUsers = { data: authResult.data.users.slice(0, 15).map(u => ({ id: u.id, full_name: u.user_metadata?.name ?? null, email: u.email ?? null, created_at: u.created_at })) };
  const diaryEntries = { data: [] as { id: string; pet_id: string; content: string; created_at: string }[] };
  const feedingEntries = { data: [] as { id: string; pet_id: string; food_name: string; created_at: string }[] };

  type ActivityItem = {
    id: string;
    type: "user" | "pet" | "diary" | "feeding" | "photo";
    label: string;
    sub: string;
    date: Date;
  };

  const items: ActivityItem[] = [];

  for (const u of newUsers.data ?? []) {
    items.push({
      id: `user-${u.id}`,
      type: "user",
      label: `Novo usuário: ${u.full_name ?? u.email ?? "Desconhecido"}`,
      sub: "Conta criada",
      date: new Date(u.created_at),
    });
  }

  for (const p of newPets.data ?? []) {
    items.push({
      id: `pet-${p.id}`,
      type: "pet",
      label: `Novo pet: ${(p as {name?: string}).name ?? "Sem nome"} (${(p as {species?: string}).species ?? "?"})`,
      sub: "Pet cadastrado",
      date: new Date(p.created_at),
    });
  }

  for (const d of diaryEntries.data ?? []) {
    items.push({
      id: `diary-${d.id}`,
      type: "diary",
      label: "Entrada no diário adicionada",
      sub: String(d.content ?? "").slice(0, 60) || "Nova entrada no diário",
      date: new Date(d.created_at),
    });
  }

  for (const f of feedingEntries.data ?? []) {
    items.push({
      id: `feed-${f.id}`,
      type: "feeding",
      label: `Alimentação registrada: ${f.food_name ?? "Alimento desconhecido"}`,
      sub: "Registro de alimentação",
      date: new Date(f.created_at),
    });
  }

  for (const ph of photos.data ?? []) {
    items.push({
      id: `photo-${ph.id}`,
      type: "photo",
      label: "Foto enviada",
      sub: "Foto do pet adicionada",
      date: new Date(ph.created_at),
    });
  }

  return items.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 40);
}

const TYPE_META = {
  user: { icon: UserPlus, color: "text-emerald-400", bg: "bg-emerald-500/10", badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  pet: { icon: PawPrint, color: "text-primary", bg: "bg-primary/10", badge: "bg-primary/20 text-primary border-primary/30" },
  diary: { icon: FileText, color: "text-violet-400", bg: "bg-violet-500/10", badge: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
  feeding: { icon: Utensils, color: "text-amber-400", bg: "bg-amber-500/10", badge: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  photo: { icon: Camera, color: "text-sky-400", bg: "bg-sky-500/10", badge: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
};

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

export default async function ActivityPage() {
  const items = await getActivity();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Atividade
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Feed em tempo real das ações dos usuários no Zupet
        </p>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(TYPE_META) as Array<keyof typeof TYPE_META>).map((type) => {
          const count = items.filter((i) => i.type === type).length;
          const { badge } = TYPE_META[type];
          return (
            <Badge key={type} className={`capitalize ${badge} hover:bg-opacity-20`}>
              {type}: {count}
            </Badge>
          );
        })}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Eventos Recentes
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-muted-foreground">Ao vivo</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Nenhuma atividade ainda</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-1">
                {items.map((item) => {
                  const meta = TYPE_META[item.type];
                  const Icon = meta.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 pl-10 py-3 relative hover:bg-secondary/20 rounded-lg transition-colors pr-2"
                    >
                      {/* Icon bubble on timeline */}
                      <div
                        className={`absolute left-0 w-8 h-8 rounded-full ${meta.bg} flex items-center justify-center flex-shrink-0 border border-border`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {item.sub}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-xs text-muted-foreground font-mono">
                        {timeAgo(item.date)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
