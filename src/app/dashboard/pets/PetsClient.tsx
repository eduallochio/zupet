"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { PawPrint, Calendar, Search } from "lucide-react";
import Pagination, { PAGE_SIZE } from "@/components/Pagination";
import FilterTabs from "@/components/FilterTabs";

type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  gender: string;
  castrated: boolean;
  owner: string;
  ownerId: string;
  emoji: string;
  createdAt: string;
};

const PIE_COLORS = [
  "hsl(174 60% 40%)",
  "hsl(262 60% 58%)",
  "hsl(45 90% 55%)",
  "hsl(340 75% 58%)",
  "hsl(210 80% 55%)",
];

const chartConfig: ChartConfig = {};

export default function PetsClient({
  pets,
  speciesData,
}: {
  pets: Pet[];
  speciesData: { name: string; value: number }[];
}) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [router]);

  const total = speciesData.reduce((a, b) => a + b.value, 0);
  const sorted = [...speciesData].sort((a, b) => b.value - a.value);

  // Filtro por espécie: vale para os botões da tabela e para os cliques nos cards/gráfico (clicar de novo limpa)
  const [speciesFilter, setSpeciesFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const toggleSpecies = (name: string) => {
    setSpeciesFilter((cur) => (cur === name ? "all" : name));
    setPage(1);
  };

  const q = query.trim().toLowerCase();
  const filtered = pets.filter(
    (p) =>
      (speciesFilter === "all" || p.species === speciesFilter) &&
      (genderFilter === "all" || p.gender === genderFilter) &&
      (!q || [p.name, p.breed, p.owner].some((s) => s.toLowerCase().includes(q)))
  );
  const pagePets = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const genders = Array.from(new Set(pets.map((p) => p.gender))).sort();
  const speciesOptions = [
    { key: "all", label: "Todas", count: pets.length },
    ...sorted.map((s) => ({ key: s.name, label: s.name, count: s.value })),
  ];
  const genderOptions = [
    { key: "all", label: "Todos", count: pets.length },
    ...genders.map((g) => ({ key: g, label: g === "—" ? "Não informado" : g.charAt(0).toUpperCase() + g.slice(1), count: pets.filter((p) => p.gender === g).length })),
  ];
  const dim = (name: string) => (speciesFilter !== "all" && speciesFilter !== name ? 0.35 : 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Pets</h1>
        <p className="text-muted-foreground text-sm mt-1">Todos os pets cadastrados nas contas do Zupet</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <PawPrint className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{pets.length}</p>
                <p className="text-xs text-muted-foreground">Total de pets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {sorted.slice(0, 3).map((s, i) => (
          <Card
            key={s.name}
            role="button"
            tabIndex={0}
            aria-pressed={speciesFilter === s.name}
            onClick={() => toggleSpecies(s.name)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSpecies(s.name); } }}
            className={`cursor-pointer transition-opacity hover:bg-secondary/40 ${speciesFilter === s.name ? "ring-2 ring-primary" : ""}`}
            style={{ opacity: dim(s.name) }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">
                  {s.name.toLowerCase().includes("cachorro") ? "🐶"
                    : s.name.toLowerCase().includes("gato") ? "🐱"
                    : s.name.toLowerCase().includes("ssaro") ? "🐦"
                    : s.name.toLowerCase().includes("coelho") ? "🐰"
                    : "🐾"}
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      {sorted.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Espécie</CardTitle>
              <CardDescription>Proporção de cada tipo de animal. Clique para filtrar a tabela.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={sorted} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={2}>
                      {sorted.map((s, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                          fillOpacity={dim(s.name)}
                          style={{ cursor: "pointer", outline: "none" }}
                          onClick={() => toggleSpecies(s.name)}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip formatter={(v, n) => [v, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2.5">
                  {sorted.map((s, i) => {
                    const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
                    return (
                      <button
                        type="button"
                        key={s.name}
                        onClick={() => toggleSpecies(s.name)}
                        aria-pressed={speciesFilter === s.name}
                        className={`block w-full text-left rounded-md px-2 py-1 -mx-2 transition-opacity hover:bg-secondary/60 ${speciesFilter === s.name ? "bg-secondary" : ""}`}
                        style={{ opacity: dim(s.name) }}
                      >
                        <div className="flex items-center justify-between text-sm mb-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <span className="font-medium">{s.name}</span>
                          </div>
                          <span className="text-muted-foreground text-xs">{s.value} ({pct}%)</span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ranking de Espécies</CardTitle>
              <CardDescription>Espécies mais populares. Clique para filtrar a tabela.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sorted.map((s, i) => {
                const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
                return (
                  <button
                    type="button"
                    key={s.name}
                    onClick={() => toggleSpecies(s.name)}
                    aria-pressed={speciesFilter === s.name}
                    className={`block w-full text-left space-y-1.5 rounded-md px-2 py-1 -mx-2 transition-opacity hover:bg-secondary/60 ${speciesFilter === s.name ? "bg-secondary" : ""}`}
                    style={{ opacity: dim(s.name) }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs font-mono w-4">#{i + 1}</span>
                        <span className="font-medium">{s.name}</span>
                      </div>
                      <span className="font-semibold">{s.value}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0">
          <CardTitle>Todos os Pets</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Buscar pet, raça ou dono…"
              aria-label="Buscar pets"
              className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-6">
            <FilterTabs options={speciesOptions} value={speciesFilter} onChange={(f) => { setSpeciesFilter(f); setPage(1); }} label="Filtrar por espécie" />
            <FilterTabs options={genderOptions} value={genderFilter} onChange={(f) => { setGenderFilter(f); setPage(1); }} label="Filtrar por gênero" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Nome</TableHead>
                <TableHead>Espécie / Raça</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Gênero</TableHead>
                <TableHead>Dono</TableHead>
                <TableHead className="pr-6">Cadastrado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12 text-sm">
                    {pets.length === 0 ? "Nenhum pet cadastrado ainda" : "Nenhum pet com esses filtros"}
                  </TableCell>
                </TableRow>
              ) : (
                pagePets.map((pet) => (
                  <TableRow key={pet.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{pet.emoji}</span>
                        <span className="text-sm font-medium">{pet.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{pet.species}</Badge>
                        {pet.breed !== "—" && <span className="text-xs text-muted-foreground">{pet.breed}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{pet.age}</TableCell>
                    <TableCell className="text-sm text-muted-foreground capitalize">{pet.gender}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <Link href={`/dashboard/users/${pet.ownerId}`} className="hover:underline hover:text-foreground">{pet.owner}</Link>
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(pet.createdAt).toLocaleDateString("pt-BR")}
                      </div>
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
