import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Baixar o app grátis",
  description:
    "Baixe o Zupet grátis para Android e iPhone. Controle vacinas, lembretes, peso e consultas do seu cachorro ou gato em um só app.",
  alternates: { canonical: "/download" },
};

export default function DownloadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
