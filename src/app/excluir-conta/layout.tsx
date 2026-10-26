import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Excluir conta e dados",
  description:
    "Solicite a exclusão da sua conta e dos seus dados no Zupet, conforme a LGPD. Veja o que é removido e como acompanhar o pedido.",
  alternates: { canonical: "/excluir-conta" },
};

export default function ExcluirContaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
