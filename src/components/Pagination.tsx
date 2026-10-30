"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export const PAGE_SIZE = 20;

/** Rodapé de paginação das tabelas (mesmo visual da lista de passeios). Some quando só há 1 página. */
export default function Pagination({
  page,
  total,
  pageSize = PAGE_SIZE,
  onPageChange,
}: {
  page: number;
  total: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  const btn =
    "h-8 w-8 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-border">
      <p className="text-xs text-muted-foreground">
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} de {total.toLocaleString("pt-BR")}
      </p>
      <div className="flex items-center gap-1">
        <button aria-label="Página anterior" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className={btn}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e-${i}`} className="h-8 w-8 flex items-center justify-center text-xs text-muted-foreground">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={page === p ? "page" : undefined}
              className={`h-8 w-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors ${page === p ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
            >
              {p}
            </button>
          )
        )}
        <button aria-label="Próxima página" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className={btn}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
