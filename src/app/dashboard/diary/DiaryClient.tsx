"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Calendar } from "lucide-react";
import { formatAppDate } from "@/lib/dates";
import Pagination, { PAGE_SIZE } from "@/components/Pagination";

type DiaryEntry = {
  id: string;
  date: string;
  mood: string;
  notes: string;
  owner: string;
  petName: string;
  petSpecies: string;
  createdAt: string;
};

const MOOD_LABELS: Record<string, string> = {
  great: "Ótimo",
  good: "Bom",
  neutral: "Normal",
  bad: "Ruim",
  sick: "Doente",
};

const MOOD_EMOJI: Record<string, string> = {
  great: "😄",
  good: "🙂",
  neutral: "😐",
  bad: "😟",
  sick: "🤒",
};

const MOOD_COLORS: Record<string, string> = {
  great: "bg-green-500/10 text-green-700 border-green-200",
  good: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  neutral: "bg-gray-500/10 text-gray-600 border-gray-200",
  bad: "bg-orange-500/10 text-orange-600 border-orange-200",
  sick: "bg-red-500/10 text-red-600 border-red-200",
};

function speciesEmoji(s: string): string {
  const l = s.toLowerCase();
  if (l.includes("cachorro") || l.includes("dog")) return "🐶";
  if (l.includes("gato") || l.includes("cat")) return "🐱";
  if (l.includes("ssaro") || l.includes("bird")) return "🐦";
  if (l.includes("coelho")) return "🐰";
  return "🐾";
}

export default function DiaryClient({
  entries,
  moodCount,
}: {
  entries: DiaryEntry[];
  moodCount: Record<string, number>;
}) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [router]);

  const [page, setPage] = useState(1);
  const total = entries.length;
  const pageEntries = entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const sickCount = moodCount["sick"] ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Diário dos Pets</h1>
        <p className="text-muted-foreground text-sm mt-1">Registros de humor e anotações diárias dos pets</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{total}</p>
                <p className="text-xs text-muted-foreground">Total de entradas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-xl">😄</div>
              <div>
                <p className="text-2xl font-heading font-bold">{(moodCount["great"] ?? 0) + (moodCount["good"] ?? 0)}</p>
                <p className="text-xs text-muted-foreground">Dias felizes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-xl">🤒</div>
              <div>
                <p className="text-2xl font-heading font-bold">{sickCount}</p>
                <p className="text-xs text-muted-foreground">Registros doentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">
                {MOOD_EMOJI[Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "neutral"]}
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">
                  {MOOD_LABELS[Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "neutral"] ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">Humor mais comum</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição de humor */}
      {total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Humor</CardTitle>
            <CardDescription>Como os pets estão se sentindo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(MOOD_LABELS).map(([key, label]) => {
              const count = moodCount[key] ?? 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      {MOOD_EMOJI[key]} {label}
                    </span>
                    <span className="text-muted-foreground text-xs">{count} ({pct}%)</span>
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
        <CardHeader>
          <CardTitle>Todas as Entradas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Pet / Dono</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Humor</TableHead>
                <TableHead className="pr-6">Anotação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-12 text-sm">
                    Nenhuma entrada no diário ainda
                  </TableCell>
                </TableRow>
              ) : (
                pageEntries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{speciesEmoji(e.petSpecies)}</span>
                        <div>
                          <p className="text-sm font-medium">{e.petName}</p>
                          <p className="text-xs text-muted-foreground">{e.owner}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatAppDate(e.date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${MOOD_COLORS[e.mood] ?? ""}`}>
                        {MOOD_EMOJI[e.mood]} {MOOD_LABELS[e.mood] ?? e.mood}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-sm text-muted-foreground max-w-[300px] truncate">
                      {e.notes || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <Pagination page={page} total={total} onPageChange={setPage} />
      </Card>
    </div>
  );
}
