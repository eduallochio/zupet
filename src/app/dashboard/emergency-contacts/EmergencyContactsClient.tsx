"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Phone } from "lucide-react";
import Pagination, { PAGE_SIZE } from "@/components/Pagination";
import FilterTabs from "@/components/FilterTabs";

type Contact = {
  id: string;
  type: string;
  name: string;
  phone: string;
  address: string | null;
  notes: string | null;
  owner: string;
  petName: string;
  petSpecies: string;
  createdAt: string;
};

const TYPE_LABELS: Record<string, string> = {
  vet: "Veterinário",
  clinic: "Clínica",
  emergency: "Emergência",
  other: "Outro",
};

const TYPE_COLORS: Record<string, string> = {
  vet: "bg-blue-500/10 text-blue-600 border-blue-200",
  clinic: "bg-purple-500/10 text-purple-600 border-purple-200",
  emergency: "bg-red-500/10 text-red-600 border-red-200",
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

export default function EmergencyContactsClient({
  contacts,
  typeCount,
}: {
  contacts: Contact[];
  typeCount: Record<string, number>;
}) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [router]);

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const filtered = contacts.filter((c) => typeFilter === "all" || c.type === typeFilter);
  const pageContacts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const filterOptions = [
    { key: "all", label: "Todos", count: contacts.length },
    ...Object.entries(TYPE_LABELS).map(([key, label]) => ({ key, label, count: typeCount[key] ?? 0 })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Contatos de Emergência</h1>
        <p className="text-muted-foreground text-sm mt-1">Veterinários e clínicas cadastrados pelos usuários</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{contacts.length}</p>
                <p className="text-xs text-muted-foreground">Total de contatos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <Card key={key}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">
                  {key === "vet" ? "👨‍⚕️" : key === "clinic" ? "🏥" : key === "emergency" ? "🚨" : "📞"}
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

      {/* Tabela */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
          <CardTitle>Todos os Contatos</CardTitle>
          <FilterTabs options={filterOptions} value={typeFilter} onChange={(f) => { setTypeFilter(f); setPage(1); }} label="Filtrar por tipo" />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Contato</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Pet / Dono</TableHead>
                <TableHead className="pr-6">Endereço</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12 text-sm">
                    {contacts.length === 0 ? "Nenhum contato de emergência cadastrado ainda" : "Nenhum contato desse tipo"}
                  </TableCell>
                </TableRow>
              ) : (
                pageContacts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="pl-6">
                      <p className="text-sm font-medium">{c.name}</p>
                      {c.notes && <p className="text-xs text-muted-foreground max-w-[160px] truncate">{c.notes}</p>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${TYPE_COLORS[c.type] ?? ""}`}>
                        {TYPE_LABELS[c.type] ?? c.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {c.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{speciesEmoji(c.petSpecies)}</span>
                        <div>
                          <p className="text-sm font-medium">{c.petName}</p>
                          <p className="text-xs text-muted-foreground">{c.owner}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 text-sm text-muted-foreground max-w-[200px] truncate">
                      {c.address ?? "—"}
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
