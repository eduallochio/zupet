import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirmação",
  description: "Confirmação de e-mail e acesso ao app Zupet.",
  robots: { index: false, follow: false },
};

export default function ConfirmarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
