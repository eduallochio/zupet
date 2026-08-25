"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Banknote, CheckCircle2, Clock, Layers } from "lucide-react";

type PaymentRow = {
  id: string;
  walkerId: string;
  walkerName: string;
  amount: number;
  status: string;
  serviceType: string | null;
  description: string | null;
  paidAt: string | null;
  createdAt: string;
};

type PagamentosData = {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  totalCount: number;
  recentPayments: PaymentRow[];
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
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}
          >
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

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PagamentosClient({ data }: { data: PagamentosData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Pagamentos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Histórico de pagamentos dos walkers no Zupet
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          icon={Layers}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          value={data.totalCount.toLocaleString("pt-BR")}
          label="Total de pagamentos"
        />
        <KpiCard
          icon={Banknote}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-600"
          value={formatBRL(data.totalAmount)}
          label="Volume total"
        />
        <KpiCard
          icon={CheckCircle2}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-600"
          value={formatBRL(data.paidAmount)}
          label="Total pago"
        />
        <KpiCard
          icon={Clock}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-600"
          value={formatBRL(data.pendingAmount)}
          label="Pendente"
        />
      </div>

      {/* Tabela de pagamentos recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Pagamentos Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Walker</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pago em</TableHead>
                <TableHead className="pr-6">Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentPayments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-12 text-sm"
                  >
                    Nenhum pagamento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                data.recentPayments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                          {p.walkerName.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm font-medium">{p.walkerName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">
                        {p.serviceType ?? "—"}
                      </p>
                      {p.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {p.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {formatBRL(p.amount)}
                    </TableCell>
                    <TableCell>
                      {p.status === "paid" ? (
                        <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10 text-xs">
                          Pago
                        </Badge>
                      ) : p.status === "pending" ? (
                        <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/30 hover:bg-amber-500/10 text-xs">
                          Pendente
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          {p.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.paidAt
                        ? new Date(p.paidAt).toLocaleDateString("pt-BR")
                        : "—"}
                    </TableCell>
                    <TableCell className="pr-6 text-sm text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString("pt-BR")}
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
