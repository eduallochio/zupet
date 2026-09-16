import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ProgressBar from "@/components/ProgressBar";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zupet.io"),
  title: {
    default: "Zupet — O app completo para cuidar do seu pet",
    template: "%s | Zupet",
  },
  description: "Vacinas, consultas, lembretes, peso e fotos do seu pet num só lugar. Baixe grátis no Google Play e App Store.",
  keywords: ["app para pets", "cuidar de pet", "vacinas pet", "lembretes pet", "saúde animal", "zupet", "app ios pet", "app iphone pet"],
  authors: [{ name: "Zupet" }],
  creator: "Zupet",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": 160, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://zupet.io",
    siteName: "Zupet",
    title: "Zupet — O app completo para cuidar do seu pet",
    description: "Vacinas, consultas, lembretes, peso e fotos do seu pet num só lugar. Baixe grátis no Google Play e App Store.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Zupet — O app completo para cuidar do seu pet" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zupet — O app completo para cuidar do seu pet",
    description: "Vacinas, consultas, lembretes, peso e fotos do seu pet num só lugar. Baixe grátis no Google Play e App Store.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${bricolage.variable} ${jakarta.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://hhgggnlnbhxvzfcmkmds.supabase.co" />
        <meta name="apple-itunes-app" content="app-id=6793655564" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ProgressBar />
        {children}
      </body>
    </html>
  );
}
