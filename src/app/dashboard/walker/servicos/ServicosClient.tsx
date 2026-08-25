"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Layers, CheckCircle2, XCircle, Users } from "lucide-react";

type ServicoRow = {
  id: string;
  walkerId: string;
  walkerName: string;
  name: string;
  description: string | null;
  price: number | null;
  durationMinutes: number | null;
  active: boolean;
  createdAt: string;
};

type ServicosData = {
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
  uniqueWalkers: number;
  rows: ServicoRow[];
};

function KpiCard({
  icon: Icon,
  iconBg,
  iconColor,
  value,
  label,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  value: string | number;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-heading font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ServicosClient({ data }: { data: ServicosData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Serviços</h1>
        <p className="text-muted-foreground text-sm mt-1">Todos os serviços cadastrados pelos walkers no Zupet</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          icon={Layers}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          value={data.totalServices.toLocaleString("pt-BR")}
          label="Total de serviços"
        />
        <KpiCard
          icon={CheckCircle2}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-600"
          value={data.activeServices.toLocaleString("pt-BR")}
          label="Ativos"
        />
        <KpiCard
          icon={XCircle}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          value={data.inactiveServices.toLocaleString("pt-BR")}
          label="Inativos"
        />
        <KpiCard
          icon={Users}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-600"
          value={data.uniqueWalkers.toLocaleString("pt-BR")}
          label="Walkers com serviço"
        />
      </div>

      {/* Tabela de serviços */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Serviços</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Walker</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6">Cadastro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12 text-sm">
                    Nenhum serviço encontrado
                  </TableCell>
                </TableRow>
              ) : (
                data.rows.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                          {s.walkerName.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm font-medium">{s.walkerName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{s.name}</p>
                      {s.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{s.description}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.price !== null
                        ? s.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.durationMinutes !== null ? `${s.durationMinutes} min` : "—"}
                    </TableCell>
                    <TableCell>
                      {s.active ? (
                        <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10 text-xs">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          Inativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="pr-6 text-sm text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString("pt-BR")}
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
