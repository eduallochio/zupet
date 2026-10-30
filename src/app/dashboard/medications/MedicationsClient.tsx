"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatAppDate, parseAppDate } from "@/lib/dates";
import { Pill, Calendar } from "lucide-react";
import Pagination, { PAGE_SIZE } from "@/components/Pagination";
import FilterTabs from "@/components/FilterTabs";

type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string | null;
  endDate: string | null;
  vet: string | null;
  note: string | null;
  active: boolean;
  owner: string;
  petName: string;
  petSpecies: string;
  createdAt: string;
};

function speciesEmoji(s: string): string {
  const l = s.toLowerCase();
  if (l.includes("cachorro") || l.includes("dog")) return "🐶";
  if (l.includes("gato") || l.includes("cat")) return "🐱";
  if (l.includes("ssaro") || l.includes("bird")) return "🐦";
  if (l.includes("coelho")) return "🐰";
  return "🐾";
}

type StatusFilter = "all" | "active" | "done";

export default function MedicationsClient({
  medications,
  activeCount,
}: {
  medications: Medication[];
  activeCount: number;
}) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [router]);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const filtered = medications.filter((m) =>
    statusFilter === "all" ? true : statusFilter === "active" ? m.active : !m.active
  );
  const pageMedications = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const filterOptions = [
    { key: "all" as const, label: "Todos", count: medications.length },
    { key: "active" as const, label: "Em tratamento", count: activeCount },
    { key: "done" as const, label: "Concluídos", count: medications.length - activeCount },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Medicamentos</h1>
        <p className="text-muted-foreground text-sm mt-1">Medicamentos em uso e histórico de tratamentos dos pets</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Pill className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{medications.length}</p>
                <p className="text-xs text-muted-foreground">Total de registros</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Pill className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Em tratamento</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">✅</div>
              <div>
                <p className="text-2xl font-heading font-bold">{medications.length - activeCount}</p>
                <p className="text-xs text-muted-foreground">Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">👨‍⚕️</div>
              <div>
                <p className="text-2xl font-heading font-bold">
                  {medications.filter((m) => m.vet).length}
                </p>
                <p className="text-xs text-muted-foreground">Com veterinário</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
          <CardTitle>Todos os Medicamentos</CardTitle>
          <FilterTabs options={filterOptions} value={statusFilter} onChange={(f) => { setStatusFilter(f); setPage(1); }} label="Filtrar por status" />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Medicamento</TableHead>
                <TableHead>Pet / Dono</TableHead>
                <TableHead>Dose / Frequência</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Veterinário</TableHead>
                <TableHead className="pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12 text-sm">
                    {medications.length === 0 ? "Nenhum medicamento registrado ainda" : "Nenhum medicamento com esse status"}
                  </TableCell>
                </TableRow>
              ) : (
                pageMedications.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="pl-6">
                      <p className="text-sm font-medium">{m.name}</p>
                      {m.note && <p className="text-xs text-muted-foreground max-w-[160px] truncate">{m.note}</p>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{speciesEmoji(m.petSpecies)}</span>
                        <div>
                          <p className="text-sm font-medium">{m.petName}</p>
                          <p className="text-xs text-muted-foreground">{m.owner}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{m.dosage}</p>
                      <p className="text-xs text-muted-foreground">{m.frequency}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatAppDate(m.startDate)}
                        {m.endDate ? ` → ${formatAppDate(m.endDate)}` : ""}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.vet ?? "—"}</TableCell>
                    <TableCell className="pr-6">
                      <Badge variant={m.active ? "default" : "secondary"} className="text-xs">
                        {m.active ? "Ativo" : "Concluído"}
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
