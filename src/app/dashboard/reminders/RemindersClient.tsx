"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatAppDate, parseAppDate } from "@/lib/dates";
import Pagination, { PAGE_SIZE } from "@/components/Pagination";
import { Bell, CheckCircle2, Clock, Calendar } from "lucide-react";

type Reminder = {
  id: string;
  category: string;
  description: string;
  date: string;
  recurrence: string;
  completed: boolean;
  completedAt: string | null;
  medicationDose: string | null;
  notes: string | null;
  owner: string;
  petName: string;
  createdAt: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  medication: "Medicação",
  vaccine: "Vacina",
  vet: "Veterinário",
  bath: "Banho",
  exam: "Exame",
  other: "Outro",
};

const RECURRENCE_LABELS: Record<string, string> = {
  once: "Uma vez",
  daily: "Diário",
  weekly: "Semanal",
  monthly: "Mensal",
  custom: "Personalizado",
};

type StatusFilter = "all" | "pending" | "done";

const CATEGORY_COLORS: Record<string, string> = {
  medication: "bg-blue-500/10 text-blue-600 border-blue-200",
  vaccine: "bg-green-500/10 text-green-600 border-green-200",
  vet: "bg-purple-500/10 text-purple-600 border-purple-200",
  bath: "bg-cyan-500/10 text-cyan-600 border-cyan-200",
  exam: "bg-orange-500/10 text-orange-600 border-orange-200",
  other: "bg-gray-500/10 text-gray-600 border-gray-200",
};

export default function RemindersClient({
  reminders,
  categoryData,
}: {
  reminders: Reminder[];
  categoryData: { name: string; value: number }[];
}) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [router]);

  const total = reminders.length;
  const completed = reminders.filter((r) => r.completed).length;
  const pending = total - completed;
  const sorted = [...categoryData].sort((a, b) => b.value - a.value);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const filtered = reminders.filter((r) =>
    statusFilter === "all" ? true : statusFilter === "done" ? r.completed : !r.completed
  );
  const pageReminders = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const filterOptions: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "Todos", count: total },
    { key: "pending", label: "Pendentes", count: pending },
    { key: "done", label: "Concluídos", count: completed },
  ];
  const changeFilter = (f: StatusFilter) => {
    setStatusFilter(f);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Lembretes</h1>
        <p className="text-muted-foreground text-sm mt-1">Todos os lembretes criados pelos usuários do Zupet</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{completed}</p>
                <p className="text-xs text-muted-foreground">Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{pending}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">
                📋
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{sorted[0]?.name ? (CATEGORY_LABELS[sorted[0].name] ?? sorted[0].name) : "—"}</p>
                <p className="text-xs text-muted-foreground">Categoria top</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categorias */}
      {sorted.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Por Categoria</CardTitle>
            <CardDescription>Distribuição dos lembretes por tipo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sorted.map((c) => {
              const pct = total > 0 ? Math.round((c.value / total) * 100) : 0;
              return (
                <div key={c.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{CATEGORY_LABELS[c.name] ?? c.name}</span>
                    <span className="text-muted-foreground text-xs">{c.value} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Tabela */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
          <CardTitle>Todos os Lembretes</CardTitle>
          <div className="flex items-center gap-1" role="group" aria-label="Filtrar por status">
            {filterOptions.map((o) => (
              <button
                key={o.key}
                onClick={() => changeFilter(o.key)}
                aria-pressed={statusFilter === o.key}
                className={`h-8 px-3 rounded-md text-xs font-medium transition-colors ${statusFilter === o.key ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
              >
                {o.label} <span className="opacity-70">({o.count})</span>
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Pet / Dono</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Recorrência</TableHead>
                <TableHead className="pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12 text-sm">
                    {reminders.length === 0 ? "Nenhum lembrete cadastrado ainda" : "Nenhum lembrete com esse status"}
                  </TableCell>
                </TableRow>
              ) : (
                pageReminders.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="pl-6">
                      <p className="text-sm font-medium max-w-[200px] truncate">{r.description}</p>
                      {r.medicationDose && <p className="text-xs text-muted-foreground">{r.medicationDose}</p>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${CATEGORY_COLORS[r.category] ?? ""}`}>
                        {CATEGORY_LABELS[r.category] ?? r.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{r.petName}</p>
                      <p className="text-xs text-muted-foreground">{r.owner}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatAppDate(r.date)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {RECURRENCE_LABELS[r.recurrence] ?? r.recurrence}
                    </TableCell>
                    <TableCell className="pr-6">
                      <Badge variant={r.completed ? "default" : "secondary"} className="text-xs">
                        {r.completed ? "Concluído" : "Pendente"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <Pagination page={page} total={filtered.length} onPageChange={setPage} />
      </Card>
    </div>
  );
}
