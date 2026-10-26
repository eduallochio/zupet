import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <p className="text-6xl" aria-hidden="true">🐾</p>
      <h1 className="text-3xl font-extrabold">Página não encontrada</h1>
      <p className="max-w-md text-muted-foreground">
        O endereço que você abriu não existe ou foi movido. Volte para o início ou baixe o app do Zupet.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-primary px-7 py-3 font-semibold text-primary-foreground"
        >
          Voltar para o início
        </Link>
        <Link href="/download" className="rounded-full border border-border px-7 py-3 font-semibold">
          Baixar o app
        </Link>
      </div>
    </main>
  );
}
