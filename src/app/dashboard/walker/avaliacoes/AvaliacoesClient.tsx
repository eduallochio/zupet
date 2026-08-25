"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Star, StarOff, ThumbsUp, ThumbsDown } from "lucide-react";

type ReviewRow = {
  id: string;
  walkerId: string;
  walkerName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

type AvaliacoesData = {
  totalReviews: number;
  avgRating: number;
  positiveReviews: number;
  negativeReviews: number;
  rating5: number;
  rating4: number;
  rating3: number;
  rating2: number;
  rating1: number;
  recentReviews: ReviewRow[];
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

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </span>
  );
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="flex items-center gap-0.5 w-24 flex-shrink-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i <= stars ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`}
          />
        ))}
      </span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-muted-foreground w-8 text-right text-xs">{count}</span>
    </div>
  );
}

export default function AvaliacoesClient({ data }: { data: AvaliacoesData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Avaliações</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Todas as avaliações recebidas pelos walkers no Zupet
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          icon={Star}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          value={data.totalReviews.toLocaleString("pt-BR")}
          label="Total de avaliações"
        />
        <KpiCard
          icon={Star}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-600"
          value={data.totalReviews > 0 ? `${data.avgRating.toFixed(1)} ★` : "—"}
          label="Nota média"
        />
        <KpiCard
          icon={ThumbsUp}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-600"
          value={data.positiveReviews.toLocaleString("pt-BR")}
          label="Avaliações positivas (≥4)"
        />
        <KpiCard
          icon={ThumbsDown}
          iconBg="bg-rose-500/10"
          iconColor="text-rose-600"
          value={data.negativeReviews.toLocaleString("pt-BR")}
          label="Avaliações negativas (≤2)"
        />
      </div>

      {/* Distribuição de notas */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Notas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.totalReviews === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma avaliação encontrada</p>
          ) : (
            <>
              <RatingBar stars={5} count={data.rating5} total={data.totalReviews} />
              <RatingBar stars={4} count={data.rating4} total={data.totalReviews} />
              <RatingBar stars={3} count={data.rating3} total={data.totalReviews} />
              <RatingBar stars={2} count={data.rating2} total={data.totalReviews} />
              <RatingBar stars={1} count={data.rating1} total={data.totalReviews} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Tabela de avaliações recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Avaliações Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Walker</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Comentário</TableHead>
                <TableHead className="pr-6">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-12 text-sm">
                    Nenhuma avaliação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                data.recentReviews.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                          {r.walkerName.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm font-medium">{r.walkerName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StarDisplay rating={r.rating} />
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {r.comment ? (
                        <p className="text-sm text-muted-foreground line-clamp-2">{r.comment}</p>
                      ) : (
                        <span className="text-sm text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="pr-6 text-sm text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("pt-BR")}
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
