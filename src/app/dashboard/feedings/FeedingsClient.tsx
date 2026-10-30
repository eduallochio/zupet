"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatAppDate, parseAppDate } from "@/lib/dates";
import { Utensils, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type Feeding = {
  id: string;
  brand: string;
  dailyAmount: string;
  lastRefillDate: string | null;
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

export default function FeedingsClient({
  feedings,
  topBrands,
}: {
  feedings: Feeding[];
  topBrands: [string, number][];
}) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [router]);

  const total = feedings.length;
  const maxBrand = topBrands[0]?.[1] ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Alimentação</h1>
        <p className="text-muted-foreground text-sm mt-1">Rações e hábitos alimentares registrados pelos tutores</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Utensils className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{total}</p>
                <p className="text-xs text-muted-foreground">Total de registros</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">🏆</div>
              <div>
                <p className="text-sm font-heading font-bold truncate max-w-[100px]">{topBrands[0]?.[0] ?? "—"}</p>
                <p className="text-xs text-muted-foreground">Ração top 1</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">🥈</div>
              <div>
                <p className="text-sm font-heading font-bold truncate max-w-[100px]">{topBrands[1]?.[0] ?? "—"}</p>
                <p className="text-xs text-muted-foreground">Ração top 2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">🥉</div>
              <div>
                <p className="text-sm font-heading font-bold truncate max-w-[100px]">{topBrands[2]?.[0] ?? "—"}</p>
                <p className="text-xs text-muted-foreground">Ração top 3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top marcas */}
      {topBrands.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Marcas Mais Usadas</CardTitle>
            <CardDescription>Rações preferidas pelos tutores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topBrands.map(([brand, count], i) => (
              <div key={brand} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs font-mono w-4">#{i + 1}</span>
                    <span className="font-medium">{brand}</span>
                  </div>
                  <span className="font-semibold">{count} pets</span>
                </div>
                <Progress value={Math.round((count / maxBrand) * 100)} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
                <TableHead>Marca</TableHead>
                <TableHead>Porção diária</TableHead>
                <TableHead>Último abastecimento</TableHead>
                <TableHead className="pr-6">Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12 text-sm">
                    Nenhum registro de alimentação ainda
                  </TableCell>
                </TableRow>
              ) : (
                feedings.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{speciesEmoji(f.petSpecies)}</span>
                        <div>
                          <p className="text-sm font-medium">{f.petName}</p>
                          <p className="text-xs text-muted-foreground">{f.owner}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{f.brand}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{f.dailyAmount}</TableCell>
                    <TableCell>
                      {f.lastRefillDate ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatAppDate(f.lastRefillDate)}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="pr-6 text-sm text-muted-foreground max-w-[200px] truncate">
                      {f.note ?? "—"}
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
