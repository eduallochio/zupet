"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatAppDate, parseAppDate } from "@/lib/dates";
import { Syringe, AlertTriangle, Clock, Calendar } from "lucide-react";

type Vaccination = {
  id: string;
  vaccineName: string;
  dateAdministered: string | null;
  nextDueDate: string | null;
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

function dueDateStatus(nextDueDate: string | null): "overdue" | "soon" | "ok" | "none" {
  if (!nextDueDate) return "none";
  const now = new Date();
  const d = parseAppDate(nextDueDate);
  if (!d) return "none";
  const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return "overdue";
  if (diff <= 30) return "soon";
  return "ok";
}

export default function VaccinationsClient({
  vaccinations,
  overdue,
  upcoming30,
}: {
  vaccinations: Vaccination[];
  overdue: number;
  upcoming30: number;
}) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Vacinações</h1>
        <p className="text-muted-foreground text-sm mt-1">Histórico de vacinas de todos os pets cadastrados</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Syringe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{vaccinations.length}</p>
                <p className="text-xs text-muted-foreground">Total de registros</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{overdue}</p>
                <p className="text-xs text-muted-foreground">Atrasadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{upcoming30}</p>
                <p className="text-xs text-muted-foreground">Vencendo em 30d</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Syringe className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{vaccinations.length - overdue - upcoming30}</p>
                <p className="text-xs text-muted-foreground">Em dia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Vacinações</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Vacina</TableHead>
                <TableHead>Pet / Dono</TableHead>
                <TableHead>Aplicada em</TableHead>
                <TableHead>Próxima dose</TableHead>
                <TableHead className="pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vaccinations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12 text-sm">
                    Nenhuma vacinação registrada ainda
                  </TableCell>
                </TableRow>
              ) : (
                vaccinations.map((v) => {
                  const status = dueDateStatus(v.nextDueDate);
                  return (
                    <TableRow key={v.id}>
                      <TableCell className="pl-6">
                        <p className="text-sm font-medium">{v.vaccineName}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{speciesEmoji(v.petSpecies)}</span>
                          <div>
                            <p className="text-sm font-medium">{v.petName}</p>
                            <p className="text-xs text-muted-foreground">{v.owner}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatAppDate(v.dateAdministered)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatAppDate(v.nextDueDate)}
                        </div>
                      </TableCell>
                      <TableCell className="pr-6">
                        {status === "overdue" && <Badge variant="destructive" className="text-xs">Atrasada</Badge>}
                        {status === "soon" && <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-200">Vence em breve</Badge>}
                        {status === "ok" && <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-200">Em dia</Badge>}
                        {status === "none" && <Badge variant="secondary" className="text-xs">Sem data</Badge>}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
