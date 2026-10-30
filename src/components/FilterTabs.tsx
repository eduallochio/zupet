"use client";

export type FilterOption<T extends string> = { key: T; label: string; count: number };

/** Botões de filtro (um selecionado por vez) para o cabeçalho das tabelas. */
export default function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  label = "Filtrar",
  clearable = true,
}: {
  options: FilterOption<T>[];
  value: T;
  onChange: (key: T) => void;
  label?: string;
  /** Clicar no filtro já marcado volta para a primeira opção. Desligar quando uma opção sempre precisa estar escolhida (ex.: período). */
  clearable?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.key}
          // Clicar no filtro já marcado desmarca e volta para a primeira opção ("Todos")
          onClick={() => onChange(clearable && value === o.key ? options[0].key : o.key)}
          aria-pressed={value === o.key}
          className={`h-8 px-3 rounded-md text-xs font-medium transition-colors ${value === o.key ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
        >
          {o.label} <span className="opacity-70">({o.count})</span>
        </button>
      ))}
    </div>
  );
}
