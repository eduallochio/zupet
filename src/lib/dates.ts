// O app grava as datas dos registros (peso, vacinas, lembretes, diário...) como texto "dd/mm/aaaa".
// `new Date("28/08/2026")` é inválido e "12/10/2026" vira 10 de dezembro: sempre ler por aqui.

/** Lê "dd/mm/aaaa", "ddmmaaaa" ou ISO ("aaaa-mm-dd...") e devolve a Date (meio-dia local), ou null. */
export function parseAppDate(value: string | null | undefined): Date | null {
  const s = (value ?? "").trim();
  if (!s) return null;

  let day: number, month: number, year: number;
  let m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/) ?? s.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (m) {
    [day, month, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  } else if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})/))) {
    [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  } else {
    return null;
  }

  const d = new Date(year, month - 1, day, 12);
  const valid = d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
  return valid ? d : null;
}

/** "dd/mm/aaaa" para exibição; "—" quando vazio ou ilegível. */
export function formatAppDate(value: string | null | undefined): string {
  const d = parseAppDate(value);
  return d ? d.toLocaleDateString("pt-BR") : "—";
}
