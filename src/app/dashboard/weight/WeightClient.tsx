"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatAppDate, parseAppDate } from "@/lib/dates";
import { Weight, Calendar } from "lucide-react";

type WeightRecord = {
  id: string;
  weight: number;
  date: string;
  note: string | null;
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

export default function WeightClient({
  records,
  avgWeight,
}: {
  records: WeightRecord[];
  avgWeight: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [router]);

  const minW = records.length > 0 ? Math.min(...records.map((r) => r.weight)).toFixed(1) : "—";
  const maxW = records.length > 0 ? Math.max(...records.map((r) => r.weight)).toFixed(1) : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Peso dos Pets</h1>
        <p className="text-muted-foreground text-sm mt-1">Histórico de registros de peso de todos os pets</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Weight className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{records.length}</p>
                <p className="text-xs text-muted-foreground">Total de registros</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">⚖️</div>
              <div>
                <p className="text-2xl font-heading font-bold">{avgWeight} kg</p>
                <p className="text-xs text-muted-foreground">Peso médio</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">🪶</div>
              <div>
                <p className="text-2xl font-heading font-bold">{minW} kg</p>
                <p className="text-xs text-muted-foreground">Menor peso</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">🏋️</div>
              <div>
                <p className="text-2xl font-heading font-bold">{maxW} kg</p>
                <p className="text-xs text-muted-foreground">Maior peso</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Registros</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Pet / Dono</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="pr-6">Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-12 text-sm">
                    Nenhum registro de peso ainda
                  </TableCell>
                </TableRow>
              ) : (
                records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{speciesEmoji(r.petSpecies)}</span>
                        <div>
                          <p className="text-sm font-medium">{r.petName}</p>
                          <p className="text-xs text-muted-foreground">{r.owner}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-bold">{r.weight} kg</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatAppDate(r.date)}
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 text-sm text-muted-foreground max-w-[200px] truncate">
                      {r.note ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
