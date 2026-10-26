import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesso restrito ao painel do Zupet.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
