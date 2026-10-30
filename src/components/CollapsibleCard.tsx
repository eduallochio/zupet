"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

const STORAGE_PREFIX = "zupet:card:collapsed:";

/**
 * Card com botão de recolher. A escolha fica salva no navegador (por `id`).
 * `actions` aparece com o card aberto; `collapsedSummary` aparece no lugar dele com o card recolhido.
 */
export default function CollapsibleCard({
  id,
  title,
  description,
  actions,
  collapsedSummary,
  contentClassName,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  collapsedSummary?: React.ReactNode;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  // Lido depois de montar para não divergir do HTML do servidor
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- precisa ser após a hidratação
      if (localStorage.getItem(STORAGE_PREFIX + id) === "1") setCollapsed(true);
    } catch {}
  }, [id]);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_PREFIX + id, next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  const contentId = `card-${id}`;

  return (
    <Card>
      <CardHeader className={collapsed ? "" : "pb-3"}>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={toggle}
            aria-expanded={!collapsed}
            aria-controls={contentId}
            title={collapsed ? "Expandir" : "Recolher"}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <div className="min-w-0">
              <CardTitle>{title}</CardTitle>
              {description && !collapsed && <CardDescription>{description}</CardDescription>}
            </div>
            {collapsed ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            ) : (
              <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            )}
          </button>
          <div className="flex shrink-0 items-center gap-3">{collapsed ? collapsedSummary : actions}</div>
        </div>
      </CardHeader>
      {/* Só é renderizado aberto: classes de display (grid) do conteúdo anulariam o atributo hidden */}
      {!collapsed && (
        <CardContent id={contentId} className={contentClassName}>
          {children}
        </CardContent>
      )}
    </Card>
  );
}
