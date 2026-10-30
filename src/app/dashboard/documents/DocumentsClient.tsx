"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatAppDate, parseAppDate } from "@/lib/dates";
import { FileText, Calendar } from "lucide-react";

type Document = {
  id: string;
  title: string;
  type: string;
  date: string | null;
  note: string | null;
  owner: string;
  petName: string;
  petSpecies: string;
  createdAt: string;
};

const TYPE_LABELS: Record<string, string> = {
  vaccine_card: "Carteira de Vacina",
  prescription: "Receita",
  exam: "Exame",
  rga: "RGA",
  other: "Outro",
};

const TYPE_COLORS: Record<string, string> = {
  vaccine_card: "bg-green-500/10 text-green-700 border-green-200",
  prescription: "bg-blue-500/10 text-blue-600 border-blue-200",
  exam: "bg-purple-500/10 text-purple-600 border-purple-200",
  rga: "bg-orange-500/10 text-orange-600 border-orange-200",
  other: "bg-gray-500/10 text-gray-600 border-gray-200",
};

function speciesEmoji(s: string): string {
  const l = s.toLowerCase();
  if (l.includes("cachorro") || l.includes("dog")) return "🐶";
  if (l.includes("gato") || l.includes("cat")) return "🐱";
  if (l.includes("ssaro") || l.includes("bird")) return "🐦";
  if (l.includes("coelho")) return "🐰";
  return "🐾";
}

export default function DocumentsClient({
  documents,
  typeCount,
}: {
  documents: Document[];
  typeCount: Record<string, number>;
}) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [router]);

  const total = documents.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Documentos</h1>
        <p className="text-muted-foreground text-sm mt-1">Documentos e arquivos registrados para os pets</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{total}</p>
                <p className="text-xs text-muted-foreground">Total de documentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {Object.entries(TYPE_LABELS).slice(0, 3).map(([key, label]) => (
          <Card key={key}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">
                  {key === "vaccine_card" ? "💉" : key === "prescription" ? "📋" : key === "exam" ? "🔬" : "📄"}
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold">{typeCount[key] ?? 0}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Distribuição por tipo */}
      {total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Por Tipo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(TYPE_LABELS).map(([key, label]) => {
              const count = typeCount[key] ?? 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{label}</span>
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
          <CardTitle>Todos os Documentos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Pet / Dono</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="pr-6">Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12 text-sm">
                    Nenhum documento registrado ainda
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="pl-6">
                      <p className="text-sm font-medium">{d.title}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${TYPE_COLORS[d.type] ?? ""}`}>
                        {TYPE_LABELS[d.type] ?? d.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{speciesEmoji(d.petSpecies)}</span>
                        <div>
                          <p className="text-sm font-medium">{d.petName}</p>
                          <p className="text-xs text-muted-foreground">{d.owner}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatAppDate(d.date)}
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 text-sm text-muted-foreground max-w-[200px] truncate">
                      {d.note ?? "—"}
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
