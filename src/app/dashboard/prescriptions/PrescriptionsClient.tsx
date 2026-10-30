"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatAppDate, parseAppDate } from "@/lib/dates";
import { ClipboardList, Calendar } from "lucide-react";

type Prescription = {
  id: string;
  vetName: string;
  clinicName: string | null;
  consultDate: string | null;
  expiryDate: string | null;
  medications: string;
  dosage: string | null;
  duration: string | null;
  notes: string | null;
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

function prescriptionStatus(expiryDate: string | null): "active" | "expired" | "none" {
  if (!expiryDate) return "none";
  const d = parseAppDate(expiryDate);
  if (!d) return "none";
  return d >= new Date() ? "active" : "expired";
}

export default function PrescriptionsClient({
  prescriptions,
  activeCount,
}: {
  prescriptions: Prescription[];
  activeCount: number;
}) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [router]);

  const expired = prescriptions.length - activeCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Prescrições</h1>
        <p className="text-muted-foreground text-sm mt-1">Receitas veterinárias registradas para os pets</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{prescriptions.length}</p>
                <p className="text-xs text-muted-foreground">Total de prescrições</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">⏰</div>
              <div>
                <p className="text-2xl font-heading font-bold">{expired}</p>
                <p className="text-xs text-muted-foreground">Vencidas</p>
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
                  {new Set(prescriptions.map((p) => p.vetName).filter((v) => v !== "—")).size}
                </p>
                <p className="text-xs text-muted-foreground">Veterinários únicos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Prescrições</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Medicamentos</TableHead>
                <TableHead>Pet / Dono</TableHead>
                <TableHead>Veterinário / Clínica</TableHead>
                <TableHead>Consulta</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead className="pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12 text-sm">
                    Nenhuma prescrição registrada ainda
                  </TableCell>
                </TableRow>
              ) : (
                prescriptions.map((p) => {
                  const status = prescriptionStatus(p.expiryDate);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="pl-6">
                        <p className="text-sm font-medium max-w-[180px] truncate">{p.medications}</p>
                        {p.dosage && <p className="text-xs text-muted-foreground">{p.dosage}</p>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{speciesEmoji(p.petSpecies)}</span>
                          <div>
                            <p className="text-sm font-medium">{p.petName}</p>
                            <p className="text-xs text-muted-foreground">{p.owner}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{p.vetName}</p>
                        {p.clinicName && <p className="text-xs text-muted-foreground">{p.clinicName}</p>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatAppDate(p.consultDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatAppDate(p.expiryDate)}
                        </div>
                      </TableCell>
                      <TableCell className="pr-6">
                        {status === "active" && <Badge variant="default" className="text-xs bg-green-600">Ativa</Badge>}
                        {status === "expired" && <Badge variant="destructive" className="text-xs">Vencida</Badge>}
                        {status === "none" && <Badge variant="secondary" className="text-xs">Sem validade</Badge>}
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
