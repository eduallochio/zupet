import Link from "next/link";
import Image from "next/image";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { FadeUp, FadeIn, ScaleIn, StaggerChildren, StaggerItem } from "@/components/landing/AnimatedSection"; // StaggerChildren/StaggerItem usados em Features e FAQ
import CountUp from "@/components/landing/CountUp";
import { ScrollStackWrapper as ScrollStack, ScrollStackItemWrapper as ScrollStackItem } from "@/components/landing/ScrollStackWrapper";
import { TrackPageView, TrackableStoreLink } from "@/components/landing/TrackingProvider";
import { FeatureCard } from "@/components/landing/FeatureCard";
import ScreenshotCarousel from "@/components/landing/ScreenshotCarousel";
import { OrbsBackground } from "@/components/landing/OrbsBackground";
import { FloatingPhone } from "@/components/landing/FloatingPhone";
import { Marquee } from "@/components/landing/Marquee";
import { GlowButton } from "@/components/landing/GlowButton";
import { Users, PawPrint, Camera, Bell, Bird, Heart, RefreshCw, WifiOff, ShieldCheck, Smartphone, Trophy } from "lucide-react";

export const revalidate = 300;

// ── SEO Metadata ──────────────────────────────────────────────────────────────
export const metadata = {
  metadataBase: new URL("https://zupet.io"),
  title: "Zupet — O app completo para cuidar do seu pet",
  description: "Zupet reúne carteira de saúde, vacinas, passaporte de viagem, controle de gastos, lembretes inteligentes e álbum de fotos do seu pet. Baixe grátis no Google Play e App Store.",
  keywords: ["app para pets", "cuidados com pets", "saúde animal", "vacinas pet", "histórico veterinário", "app cachorro", "app gato", "passaporte pet", "viagem com pet", "Zupet", "app android pet"],
  openGraph: {
    title: "Zupet — O app completo para cuidar do seu pet",
    description: "Carteira de saúde, vacinas, passaporte de viagem, gastos e lembretes do seu pet em um só lugar. Baixe grátis no Google Play e App Store.",
    type: "website",
    url: "https://zupet.io",
    locale: "pt_BR",
    siteName: "Zupet",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Zupet — O app completo para cuidar do seu pet" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@zupet_io",
    title: "Zupet — O app completo para cuidar do seu pet",
    description: "Carteira de saúde, passaporte de viagem, controle de gastos e lembretes inteligentes para o seu pet. Grátis no Google Play e App Store.",
  },
  alternates: { canonical: "https://zupet.io" },
  robots: { index: true, follow: true, "max-snippet": 160, "max-image-preview": "large" },
};

// ── Structured Data ────────────────────────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "Zupet",
  description: "App para gestão de saúde e cuidados de pets — histórico veterinário, vacinas, alimentação e fotos.",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Android, iOS",
  installUrl: "https://play.google.com/store/apps/details?id=io.zupet.app&hl=pt_BR",
  applicationSubCategory: "https://schema.org/LifestyleApplication",
  downloadUrl: [
    "https://play.google.com/store/apps/details?id=io.zupet.app&hl=pt_BR",
    "https://apps.apple.com/br/app/zupet/id6793655564",
  ],
  offers: { "@type": "Offer", price: "0", priceCurrency: "BRL", availability: "https://schema.org/InStock" },
  publisher: { "@type": "Organization", name: "Zupet", logo: { "@type": "ImageObject", url: "https://zupet.io/icon.png" } },
  screenshot: [
    { "@type": "ImageObject", url: "https://zupet.io/screenshots/perfil-pet.png" },
    { "@type": "ImageObject", url: "https://zupet.io/screenshots/agenda.png" },
    { "@type": "ImageObject", url: "https://zupet.io/screenshots/conquistas.png" },
  ],
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Zupet",
  url: "https://zupet.io",
  logo: "https://zupet.io/icon.png",
  sameAs: [
    "https://www.instagram.com/zupet.io/",
    "https://play.google.com/store/apps/details?id=io.zupet.app&hl=pt_BR",
    "https://apps.apple.com/br/app/zupet/id6793655564",
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "O Zupet é gratuito?", acceptedAnswer: { "@type": "Answer", text: "Sim, o download e uso básico são completamente gratuitos. Você pode cadastrar seus pets, registrar vacinas, alimentação e fotos sem pagar nada." } },
    { "@type": "Question", name: "Funciona sem internet?", acceptedAnswer: { "@type": "Answer", text: "Sim. O Zupet funciona em modo offline e sincroniza automaticamente quando você reconectar. Nunca perde dados." } },
    { "@type": "Question", name: "Quantos pets posso cadastrar?", acceptedAnswer: { "@type": "Answer", text: "Quantos quiser. Cachorros, gatos, pássaros, coelhos — o Zupet suporta múltiplos pets e espécies na mesma conta." } },
    { "@type": "Question", name: "Meus dados são seguros?", acceptedAnswer: { "@type": "Answer", text: "Sim. Seus dados são criptografados e armazenados com segurança. Nunca compartilhamos informações pessoais com terceiros." } },
    { "@type": "Question", name: "Posso usar em mais de um dispositivo?", acceptedAnswer: { "@type": "Answer", text: "Sim. Faça login com sua conta Google ou Apple em qualquer dispositivo e seus dados estarão sempre sincronizados." } },
    { "@type": "Question", name: "O Zupet está disponível para iOS?", acceptedAnswer: { "@type": "Answer", text: "Sim! O Zupet está disponível gratuitamente na App Store para iPhone e iPad, além da Google Play Store para Android." } },
  ],
};

async function getPublicStats() {
  try {
    const [
      { count: totalPets },
      { count: totalPhotos },
      { count: totalReminders },
      { count: totalDiary },
      { data: speciesRaw },
      { data: { users: authUsers } },
    ] = await Promise.all([
      supabaseAdmin.from("pets").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("pet_photos").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("reminders").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("diary_entries").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("pets").select("species"),
      supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
    ]);

    const speciesMap: Record<string, number> = {};
    for (const p of speciesRaw ?? []) {
      const s = p.species ?? "Outros";
      speciesMap[s] = (speciesMap[s] ?? 0) + 1;
    }
    const topSpecies = Object.entries(speciesMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const totalSpecies = Object.keys(speciesMap).length;
    const avgPetsPerUser = authUsers.length > 0
      ? Math.round(((totalPets ?? 0) / authUsers.length) * 10) / 10
      : 0;

    return {
      totalUsers: authUsers.length,
      totalPets: totalPets ?? 0,
      totalPhotos: totalPhotos ?? 0,
      totalReminders: totalReminders ?? 0,
      totalDiary: totalDiary ?? 0,
      totalSpecies,
      avgPetsPerUser,
      topSpecies,
    };
  } catch {
    return {
      totalUsers: 0, totalPets: 0, totalPhotos: 0,
      totalReminders: 0, totalDiary: 0, totalSpecies: 0,
      avgPetsPerUser: 0, topSpecies: null,
    };
  }
}

const features = [
  { icon: "Stethoscope", title: "Carteira de Saúde", description: "Vacinas, consultas, medicamentos e exames reunidos em um documento completo com QR Code para compartilhar com o veterinário." },
  { icon: "PlaneTakeoff", title: "Passaporte de Viagem", description: "Planeje viagens com seu pet. Checklist inteligente para carro, voo nacional e internacional — nunca esqueça um documento." },
  { icon: "Bell", title: "Lembretes Inteligentes", description: "Notificações personalizadas para vacinas, consultas e medicamentos. O app avisa antes do vencimento e reagenda automaticamente." },
  { icon: "Camera", title: "Álbum com Tags", description: "Organize as fotos do seu pet por categoria — veterinário, passeio, aniversário, banho. Memórias que duram para sempre." },
  { icon: "Wallet", title: "Controle de Gastos", description: "Registre gastos com veterinário, ração, banho e acessórios. Veja o resumo mensal e quanto você investe em cada pet." },
  { icon: "UtensilsCrossed", title: "Gestão de Alimentação", description: "Controle o estoque de ração com alertas de reabastecimento. Nunca deixe o pote vazio novamente." },
  { icon: "Trophy", title: "Conquistas e Desafios", description: "Ganhe conquistas cuidando bem dos seus pets. Desafios semanais tornam a rotina de cuidados mais divertida e motivadora." },
  { icon: "WifiOff", title: "Funciona Offline", description: "Acesse o histórico completo do seu pet sem internet. Sincroniza automaticamente na nuvem quando conectar — com backup seguro." },
];

export default async function LandingPage() {
  const stats = await getPublicStats();
  const hasStats = false; // temporariamente oculto até ter dados satisfatórios

  return (
    <>
      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
      {/* Page view tracking */}
      <TrackPageView />

      <div className="min-h-screen overflow-x-hidden" style={{ background: "oklch(0.10 0 0)", color: "oklch(0.96 0 0)" }}>

        {/* ── Nav ─────────────────────────────────────────────────────────── */}
        <header
          className="sticky top-0 z-50 border-b"
          style={{ background: "oklch(0.10 0 0 / 0.92)", backdropFilter: "blur(20px) saturate(180%)", borderColor: "oklch(0.18 0 0)" }}
        >
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Image src="/icon.png" alt="Zupet" width={32} height={32} className="rounded-xl" />
              <span className="font-heading font-bold text-lg tracking-tight" style={{ color: "oklch(0.97 0 0)" }}>Zupet</span>
            </div>
            <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-1 text-sm font-medium">
              <a href="#features" className="px-4 py-2 rounded-lg transition-colors text-[oklch(0.78_0_0)] hover:text-white">Funcionalidades</a>
              {hasStats && (
                <a href="#stats" className="px-4 py-2 rounded-lg transition-colors text-[oklch(0.78_0_0)] hover:text-white">Números</a>
              )}
              <a href="#early-access" className="px-4 py-2 rounded-lg transition-colors text-[oklch(0.78_0_0)] hover:text-white">Download</a>
            </nav>
            <div className="flex items-center gap-2">
              <a
                href="https://www.instagram.com/zupet.io/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram do Zupet"
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:scale-110"
                style={{ color: "oklch(0.72 0 0)" }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <Link
                href="/dashboard"
                className="text-sm font-medium px-4 py-2 rounded-lg border transition-all hover:border-white/20 hover:text-white"
                style={{ color: "oklch(0.80 0 0)", borderColor: "oklch(0.24 0 0)", background: "oklch(0.13 0 0)" }}
              >
                Painel
              </Link>
              <a
                href="#early-access"
                className="text-sm font-semibold px-5 py-2 rounded-lg transition-all hover:opacity-90 hover:scale-[1.03] active:scale-95"
                style={{ background: "oklch(0.62 0.18 174)", color: "white", boxShadow: "0 4px 20px oklch(0.62 0.18 174 / 0.35)" }}
              >
                Baixar grátis
              </a>
            </div>
          </div>
        </header>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col justify-center px-6 overflow-hidden">
          {/* Grid background sutil */}
          <div aria-hidden className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(oklch(0.22 0 0 / 0.4) 1px, transparent 1px), linear-gradient(90deg, oklch(0.22 0 0 / 0.4) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
              maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 100%)",
            }} />

          {/* Orbes animados */}
          <OrbsBackground />

          <div className="max-w-6xl mx-auto w-full relative">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center pt-24 pb-16 lg:pt-0 lg:pb-0">

              {/* Lado esquerdo — copy */}
              <div>
                <FadeIn delay={0}>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
                    style={{ background: "oklch(0.62 0.18 174 / 0.10)", border: "1px solid oklch(0.62 0.18 174 / 0.22)", color: "oklch(0.72 0.14 174)" }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "oklch(0.62 0.18 174)" }} />
                    Disponível no Google Play e App Store
                  </div>
                </FadeIn>

                <FadeUp delay={0.08}>
                  <h1 className="font-heading font-extrabold leading-[1.0] tracking-tight">
                    <span className="block text-5xl md:text-6xl lg:text-7xl" style={{ color: "oklch(0.97 0 0)" }}>
                      Seu pet merece
                    </span>
                    <span className="block text-5xl md:text-6xl lg:text-7xl animated-gradient-text">
                      memória perfeita.
                    </span>
                  </h1>
                </FadeUp>

                <FadeUp delay={0.18}>
                  <p className="mt-6 text-base md:text-lg leading-relaxed max-w-md"
                    style={{ color: "oklch(0.72 0 0)" }}>
                    Vacinas, consultas, alimentação, fotos — tudo num só lugar.
                    Nunca mais esqueça nada importante sobre quem você mais ama.
                  </p>
                </FadeUp>

                <FadeUp delay={0.26}>
                  <div className="mt-8 flex flex-col gap-4">
                    {/* Botões de loja */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <TrackableStoreLink
                        store="android"
                        href="https://play.google.com/store/apps/details?id=io.zupet.app&hl=pt_BR"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                        style={{ background: "oklch(0.62 0.18 174)", color: "white", boxShadow: "0 4px 20px oklch(0.62 0.18 174 / 0.35)" }}
                        aria-label="Baixar Zupet para Android na Google Play"
                      >
                        <Image src="/stores/google-play.png" alt="Baixar Zupet no Google Play" width={140} height={42} className="h-8 w-auto" />
                      </TrackableStoreLink>
                      <TrackableStoreLink
                        store="ios"
                        href="https://apps.apple.com/br/app/zupet/id6793655564"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                        style={{ background: "oklch(0.15 0 0)", border: "1px solid oklch(0.30 0 0)", color: "white", boxShadow: "0 4px 20px oklch(0.15 0 0 / 0.5)" }}
                        aria-label="Baixar Zupet para iOS na App Store"
                      >
                        <Image src="/stores/app-store.svg" alt="Baixar Zupet na App Store" width={140} height={42} className="h-8 w-auto" />
                      </TrackableStoreLink>
                    </div>

                    <p className="text-xs leading-relaxed" style={{ color: "oklch(0.60 0 0)" }}>
                      Gratuito • Disponível na Google Play e App Store
                    </p>
                  </div>
                </FadeUp>

                {/* Prova social */}
                {hasStats && (
                  <FadeIn delay={0.38}>
                    <div className="mt-10 flex items-center gap-6 flex-wrap">
                      {[
                        { value: stats.totalPets, label: "pets cadastrados", icon: <PawPrint size={14} strokeWidth={1.5} /> },
                        { value: stats.totalUsers, label: "tutores ativos", icon: <Users size={14} strokeWidth={1.5} /> },
                        { value: stats.totalPhotos, label: "fotos salvas", icon: <Camera size={14} strokeWidth={1.5} /> },
                      ].map(({ value, label, icon }) => (
                        <div key={label} className="flex items-center gap-2">
                          <span className="text-sm" style={{ color: "oklch(0.72 0.14 174)" }}>{icon}</span>
                          <div>
                            <p className="text-sm font-bold leading-none" style={{ color: "oklch(0.90 0 0)" }}>
                              {value.toLocaleString("pt-BR")}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: "oklch(0.63 0 0)" }}>{label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </FadeIn>
                )}
              </div>

              {/* Lado direito — mockup do app */}
              <ScaleIn delay={0.2} className="flex justify-center lg:justify-end">
                <div className="relative">
                  {/* Glow atrás do celular */}
                  <div aria-hidden className="absolute inset-0 rounded-[3rem]"
                    style={{ background: "radial-gradient(ellipse, oklch(0.62 0.18 174 / 0.25) 0%, transparent 70%)", filter: "blur(30px)", transform: "scale(1.2)" }} />

                  {/* Mockup flutuante animado */}
                  <FloatingPhone
                    src="/screenshots/perfil-pet.png"
                    alt="Zupet — tela de perfil do pet"
                  />

                  {/* Card flutuante — vacina */}
                  <FadeUp delay={0.5}>
                    <div className="absolute -left-16 top-[22%] px-3 py-2.5 rounded-2xl text-xs"
                      style={{
                        background: "oklch(0.16 0 0 / 0.95)",
                        border: "1px solid oklch(0.70 0 0)",
                        backdropFilter: "blur(12px)",
                        boxShadow: "0 8px 24px oklch(0 0 0 / 0.4)",
                        minWidth: "140px",
                      }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                          style={{ background: "oklch(0.62 0.18 174 / 0.2)", color: "oklch(0.62 0.18 174)" }}>✓</span>
                        <span style={{ color: "oklch(0.62 0.18 174)" }} className="font-medium">Lembrete</span>
                      </div>
                      <p className="font-semibold" style={{ color: "oklch(0.88 0 0)" }}>Vacina V10</p>
                      <p style={{ color: "oklch(0.65 0 0)" }}>amanhã às 10h</p>
                    </div>
                  </FadeUp>

                  {/* Card flutuante — conquista */}
                  <FadeUp delay={0.65}>
                    <div className="absolute -right-14 bottom-[25%] px-3 py-2.5 rounded-2xl text-xs"
                      style={{
                        background: "oklch(0.16 0 0 / 0.95)",
                        border: "1px solid oklch(0.70 0 0)",
                        backdropFilter: "blur(12px)",
                        boxShadow: "0 8px 24px oklch(0 0 0 / 0.4)",
                        minWidth: "130px",
                      }}>
                      <p className="text-base mb-0.5">🏆</p>
                      <p className="font-semibold" style={{ color: "oklch(0.88 0 0)" }}>Nova conquista!</p>
                      <p style={{ color: "oklch(0.65 0 0)" }}>Tutor dedicado</p>
                    </div>
                  </FadeUp>

                  {/* Card flutuante — foto */}
                  <FadeIn delay={0.8}>
                    <div className="absolute -right-10 top-[12%] px-3 py-2 rounded-xl text-xs flex items-center gap-2"
                      style={{
                        background: "oklch(0.16 0 0 / 0.95)",
                        border: "1px solid oklch(0.70 0 0)",
                        backdropFilter: "blur(12px)",
                        boxShadow: "0 8px 24px oklch(0 0 0 / 0.4)",
                      }}>
                      <span className="text-base">📸</span>
                      <div>
                        <p className="font-medium" style={{ color: "oklch(0.88 0 0)" }}>Nova foto</p>
                        <p style={{ color: "oklch(0.65 0 0)" }}>salva agora</p>
                      </div>
                    </div>
                  </FadeIn>
                </div>
              </ScaleIn>
            </div>

            {/* Scroll hint */}
            <FadeIn delay={1.0}>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2">
                <span className="text-xs tracking-widest uppercase" style={{ color: "oklch(0.72 0 0)" }}>scroll</span>
                <div className="w-px h-8 relative overflow-hidden" style={{ background: "oklch(0.50 0 0)" }}>
                  <div className="absolute top-0 left-0 w-full h-1/2 animate-bounce" style={{ background: "oklch(0.62 0.18 174)" }} />
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── Stats com ScrollStack ─────────────────────────────────────── */}
        {hasStats && (
          <section id="stats" className="relative py-24 px-6">
            <div className="max-w-3xl mx-auto">
              <FadeUp className="text-center mb-4">
                <p className="text-xs font-mono tracking-widest uppercase" style={{ color: "oklch(0.62 0 0)" }}>
                  — dados reais da plataforma —
                </p>
              </FadeUp>

              <div style={{ height: "80vh" }}>
                <ScrollStack
                  itemScale={0.03}
                  itemStackDistance={30}
                  stackPosition="20%"
                  scaleEndPosition="10%"
                  baseScale={0.85}
                >
                  {[
                    { num: stats.totalUsers,     suffix: "+", label: "Tutores ativos",      desc: "e crescendo todo mês",          icon: <Users size={32} strokeWidth={1.5} />,         accent: "oklch(0.62 0.18 174)" },
                    { num: stats.totalPets,      suffix: "+", label: "Pets cadastrados",    desc: "cachorros, gatos e mais",       icon: <PawPrint size={32} strokeWidth={1.5} />,      accent: "oklch(0.65 0.18 145)" },
                    { num: stats.totalPhotos,    suffix: "+", label: "Fotos salvas",        desc: "memórias preservadas",          icon: <Camera size={32} strokeWidth={1.5} />,        accent: "oklch(0.62 0.18 240)" },
                    { num: stats.totalReminders, suffix: "+", label: "Lembretes criados",   desc: "vacinas, consultas e mais",     icon: <Bell size={32} strokeWidth={1.5} />,          accent: "oklch(0.68 0.18 60)"  },
                    { num: stats.totalSpecies,   suffix: "",  label: "Espécies diferentes", desc: "toda família merece cuidado",   icon: <Bird size={32} strokeWidth={1.5} />,          accent: "oklch(0.65 0.18 30)"  },
                    { num: stats.avgPetsPerUser, suffix: "",  label: "Pets por tutor",      desc: "em média por conta cadastrada", icon: <Heart size={32} strokeWidth={1.5} />,         accent: "oklch(0.65 0.18 10)"  },
                  ].map(({ num, suffix, label, desc, icon, accent }) => (
                    <ScrollStackItem key={label}>
                      <div className="w-full h-full p-8 flex items-center justify-between gap-6"
                        style={{ background: "oklch(0.13 0 0)", border: "1px solid oklch(0.50 0 0)" }}>
                        <div className="flex-1">
                          <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "oklch(0.60 0 0)" }}>{label}</p>
                          <p className="font-heading text-6xl md:text-7xl font-extrabold leading-none">
                            <CountUp to={num} duration={2} suffix={suffix} gradient gradientFrom={accent} gradientTo="oklch(0.92 0.05 174)" />
                          </p>
                          <p className="mt-3 text-sm" style={{ color: "oklch(0.65 0 0)" }}>{desc}</p>
                        </div>
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${accent.replace(")", " / 0.10)")}`, border: `1px solid ${accent.replace(")", " / 0.20)")}`, color: accent }}>
                          {icon}
                        </div>
                      </div>
                    </ScrollStackItem>
                  ))}
                </ScrollStack>
              </div>
            </div>
          </section>
        )}

        {/* ── Features ────────────────────────────────────────────────────── */}
        <section id="features" className="py-28 px-6 relative overflow-hidden" style={{ background: "oklch(0.115 0 0)" }}>
          <div aria-hidden className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, oklch(0.62 0.18 174 / 0.4), transparent)" }} />
          <div aria-hidden className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, oklch(0.62 0.18 174 / 0.2), transparent)" }} />

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-start">
              {/* Lado esquerdo — sticky label */}
              <FadeUp className="lg:sticky lg:top-32">
                <p className="text-xs font-mono tracking-widest uppercase mb-4" style={{ color: "oklch(0.62 0.18 174)" }}>
                  Funcionalidades
                </p>
                <h2 className="font-heading text-4xl md:text-5xl font-bold leading-[1.05]" style={{ color: "oklch(0.96 0 0)" }}>
                  Tudo que<br />o seu pet<br />precisa.
                </h2>
                <p className="mt-5 text-sm leading-relaxed" style={{ color: "oklch(0.68 0 0)" }}>
                  Do registro diário de alimentação ao histórico médico completo.
                </p>
                <div className="mt-8 w-12 h-px" style={{ background: "oklch(0.62 0.18 174)" }} />
              </FadeUp>

              {/* Lado direito — grid de features */}
              <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 gap-3" stagger={0.07}>
                {features.map(({ icon, title, description }) => (
                  <StaggerItem key={title}>
                    <FeatureCard icon={icon} title={title} description={description} />
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </div>
          </div>
        </section>

        {/* ── Para cada tutor ──────────────────────────────────────────────── */}
        <section className="py-28 px-6 relative overflow-hidden" style={{ background: "oklch(0.10 0 0)" }}>
          <div className="max-w-6xl mx-auto">
            <FadeUp className="text-center mb-14">
              <p className="text-xs font-mono tracking-widest uppercase mb-4" style={{ color: "oklch(0.62 0.18 174)" }}>
                Para cada tutor
              </p>
              <h2 className="font-heading text-4xl md:text-5xl font-bold leading-[1.05]" style={{ color: "oklch(0.96 0 0)" }}>
                Feito para cuidar <span className="animated-gradient-text">do seu jeito.</span>
              </h2>
              <p className="mt-5 text-sm leading-relaxed max-w-md mx-auto" style={{ color: "oklch(0.68 0 0)" }}>
                Não importa quantos pets você tem ou como cuida deles — o Zupet se adapta.
              </p>
            </FadeUp>

            <StaggerChildren className="grid grid-cols-1 sm:grid-cols-3 gap-4" stagger={0.1}>
              {[
                { icon: "PawPrint", title: "Família com vários pets", description: "Cadastre cachorros, gatos e outras espécies na mesma conta. Cada pet com seu próprio histórico, vacinas e lembretes — sem misturar nada." },
                { icon: "HeartPulse", title: "Pets idosos ou com cuidados especiais", description: "Acompanhe peso, medicamentos contínuos e consultas frequentes. Tudo num histórico que você pode mostrar ao veterinário em segundos." },
                { icon: "PlaneTakeoff", title: "Tutores que viajam com o pet", description: "Passaporte de viagem com checklist para carro, voo nacional ou internacional. Nunca esqueça um documento ou vacina obrigatória." },
              ].map(({ icon, title, description }) => (
                <StaggerItem key={title}>
                  <FeatureCard icon={icon} title={title} description={description} />
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* ── Screenshots ─────────────────────────────────────────────────── */}
        <section className="py-28 px-6 overflow-hidden" style={{ background: "oklch(0.10 0 0)" }}>
          <div className="max-w-6xl mx-auto">
            <FadeUp className="mb-16">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  <p className="text-xs font-mono tracking-widest uppercase mb-3" style={{ color: "oklch(0.62 0.18 174)" }}>App em ação</p>
                  <h2 className="font-heading text-4xl md:text-5xl font-bold leading-tight" style={{ color: "oklch(0.96 0 0)" }}>
                    Simples, bonito<br />e completo.
                  </h2>
                </div>
                <p className="text-sm max-w-xs leading-relaxed" style={{ color: "oklch(0.65 0 0)" }}>
                  Cada tela desenhada para ser intuitiva do primeiro acesso. Clique em qualquer imagem para ampliar.
                </p>
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <ScreenshotCarousel />
            </FadeUp>
          </div>
        </section>

        {/* ── Marquee de funcionalidades ──────────────────────────────────── */}
        <div style={{ background: "oklch(0.10 0 0)", borderTop: "1px solid oklch(0.18 0 0)", borderBottom: "1px solid oklch(0.18 0 0)" }}>
          <Marquee />
        </div>

        {/* ── Download / Plataformas ───────────────────────────────────────── */}
        <section className="py-28 px-6 relative overflow-hidden" style={{ background: "oklch(0.115 0 0)" }}>
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px]"
              style={{ background: "radial-gradient(ellipse, oklch(0.62 0.18 174 / 0.07) 0%, transparent 65%)", filter: "blur(60px)" }} />
          </div>
          <div className="max-w-5xl mx-auto relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Esquerda — copy */}
              <FadeUp>
                <p className="text-xs font-mono tracking-widest uppercase mb-4" style={{ color: "oklch(0.62 0.18 174)" }}>Disponibilidade</p>
                <h2 className="font-heading text-4xl md:text-5xl font-bold leading-[1.05] mb-6" style={{ color: "oklch(0.96 0 0)" }}>
                  No seu bolso,<br />onde você for.
                </h2>
                <p className="text-sm leading-relaxed mb-10" style={{ color: "oklch(0.68 0 0)" }}>
                  Funciona offline, sincroniza automaticamente, protegido com login social.
                  O cuidado do seu pet não pode depender de conexão.
                </p>
                <div className="flex flex-col gap-4">
                  {[
                    { icon: <RefreshCw size={16} strokeWidth={1.5} />, text: "Sincronização automática entre dispositivos" },
                    { icon: <WifiOff size={16} strokeWidth={1.5} />,  text: "Modo offline completo — funciona sem internet" },
                    { icon: <ShieldCheck size={16} strokeWidth={1.5} />, text: "Login com Google e Apple — seguro e rápido" },
                    { icon: <Bell size={16} strokeWidth={1.5} />,     text: "Notificações push personalizadas por pet" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "oklch(0.62 0.18 174 / 0.10)", border: "1px solid oklch(0.62 0.18 174 / 0.15)", color: "oklch(0.72 0.14 174)" }}>
                        {icon}
                      </div>
                      <span className="text-sm" style={{ color: "oklch(0.62 0 0)" }}>{text}</span>
                    </div>
                  ))}
                </div>
              </FadeUp>

              {/* Direita — cards de loja */}
              <ScaleIn delay={0.15}>
                <div className="flex flex-col gap-4">
                  {/* Android — disponível */}
                  <a
                    href="https://play.google.com/store/apps/details?id=io.zupet.app&hl=pt_BR"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative p-6 rounded-2xl flex items-center gap-5 transition-all hover:scale-[1.02]"
                    style={{
                      background: "oklch(0.13 0 0)",
                      border: "1px solid oklch(0.62 0.18 174 / 0.35)",
                      boxShadow: "0 0 40px oklch(0.62 0.18 174 / 0.06)",
                    }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "oklch(0.62 0.18 174 / 0.15)" }}>
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#34A853">
                        <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48A5.84 5.84 0 0 0 12 1.5c-.76 0-1.48.15-2.14.43L8.38.45c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.3 1.3A5.9 5.9 0 0 0 6.5 7h11a5.9 5.9 0 0 0-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold" style={{ color: "oklch(0.90 0 0)" }}>Android</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                          style={{ background: "oklch(0.62 0.18 174 / 0.20)", color: "oklch(0.72 0.14 174)" }}>
                          Disponível
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: "oklch(0.62 0 0)" }}>Download grátis na Google Play Store</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "oklch(0.50 0 0)", flexShrink: 0 }}>
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </a>

                  {/* iOS — disponível */}
                  <a
                    href="https://apps.apple.com/br/app/zupet/id6793655564"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative p-6 rounded-2xl flex items-center gap-5 transition-all hover:scale-[1.02]"
                    style={{
                      background: "oklch(0.13 0 0)",
                      border: "1px solid oklch(0.35 0 0 / 0.5)",
                      boxShadow: "0 0 40px oklch(0.35 0 0 / 0.06)",
                    }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "oklch(0.20 0 0)" }}>
                      <svg viewBox="0 0 814 1000" className="w-5 h-5" fill="white">
                        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.4-150.3-110.7C67.3 716.3 29 614.8 29 518.5c0-169.2 110.6-258.7 220-258.7 81.5 0 149.4 53.8 200.8 53.8 49.2 0 126.7-56.9 217.1-56.9zM581 86.8c27.7-32.9 47.8-79.2 47.8-125.5 0-6.4-.6-12.8-1.9-18.5-45.2 1.7-98.8 30.2-131.3 67.2-25.1 27.7-48.4 73.4-48.4 120.3 0 7 1.3 14 1.9 16.4 2.6.4 6.7 1 10.8 1 40.8 0 91.9-26.8 121.1-60.9z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold" style={{ color: "oklch(0.90 0 0)" }}>iOS</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                          style={{ background: "oklch(0.62 0.18 174 / 0.20)", color: "oklch(0.72 0.14 174)" }}>
                          Disponível
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: "oklch(0.62 0 0)" }}>Download grátis na App Store</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "oklch(0.50 0 0)", flexShrink: 0 }}>
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                </div>
              </ScaleIn>
            </div>
          </div>
        </section>

        {/* ── Download ─────────────────────────────────────────────── */}
        <section id="early-access" className="py-28 px-6 relative overflow-hidden" style={{ background: "oklch(0.10 0 0)" }}>
          <div aria-hidden className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, oklch(0.62 0.18 174 / 0.4), transparent)" }} />
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px]"
              style={{ background: "radial-gradient(ellipse, oklch(0.62 0.18 174 / 0.06) 0%, transparent 65%)", filter: "blur(60px)" }} />
          </div>

          <div className="max-w-3xl mx-auto relative text-center">
            <FadeUp>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
                style={{ background: "oklch(0.62 0.18 174 / 0.12)", border: "1px solid oklch(0.62 0.18 174 / 0.30)", color: "oklch(0.72 0.14 174)" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "oklch(0.62 0.18 174)" }} />
                Disponível na Google Play e App Store
              </div>

              <h2 className="font-heading text-4xl md:text-5xl font-bold leading-tight mb-6" style={{ color: "oklch(0.96 0 0)" }}>
                Baixe o Zupet<br />gratuitamente
              </h2>
              <p className="text-base leading-relaxed mb-4 max-w-xl mx-auto" style={{ color: "oklch(0.68 0 0)" }}>
                O Zupet está disponível na <strong style={{ color: "oklch(0.82 0 0)" }}>Google Play Store</strong> e na <strong style={{ color: "oklch(0.82 0 0)" }}>App Store</strong>.
                Baixe grátis e comece a cuidar do seu pet com muito mais organização.
              </p>
              <p className="text-sm leading-relaxed mb-12 max-w-lg mx-auto" style={{ color: "oklch(0.60 0 0)" }}>
                Cadastre-se, adicione seus pets e tenha toda a história deles na palma da mão — vacinas, consultas, fotos e muito mais.
              </p>
            </FadeUp>

            {/* Steps */}
            <FadeUp delay={0.1}>
              <div className="grid md:grid-cols-3 gap-4 mb-14 text-left">
                {[
                  {
                    step: "01",
                    icon: <Smartphone size={24} strokeWidth={1.5} />,
                    title: "Baixe o app",
                    desc: "Acesse a Google Play Store ou a App Store e instale o Zupet gratuitamente.",
                  },
                  {
                    step: "02",
                    icon: <PawPrint size={24} strokeWidth={1.5} />,
                    title: "Cadastre seus pets",
                    desc: "Crie seu perfil, adicione seus pets e personalize com foto, raça e informações de saúde.",
                  },
                  {
                    step: "03",
                    icon: <Trophy size={24} strokeWidth={1.5} />,
                    title: "Cuide com prazer",
                    desc: "Registre vacinas, lembretes, fotos e conquistas. Tudo organizado em um só lugar.",
                  },
                ].map(({ step, icon, title, desc }) => (
                  <div key={step} className="p-5 rounded-2xl flex flex-col gap-3"
                    style={{ background: "oklch(0.13 0 0)", border: "1px solid oklch(0.20 0 0)" }}>
                    <div className="flex items-center justify-between">
                      <span style={{ color: "oklch(0.72 0.14 174)" }}>{icon}</span>
                      <span className="text-xs font-mono" style={{ color: "oklch(0.40 0 0)" }}>{step}</span>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: "oklch(0.88 0 0)" }}>{title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: "oklch(0.58 0 0)" }}>{desc}</p>
                  </div>
                ))}
              </div>
            </FadeUp>

            {/* CTA Lojas */}
            <FadeUp delay={0.2}>
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  <TrackableStoreLink
                    store="android"
                    href="https://play.google.com/store/apps/details?id=io.zupet.app&hl=pt_BR"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                    style={{ background: "oklch(0.62 0.18 174)", color: "white", boxShadow: "0 8px 32px oklch(0.62 0.18 174 / 0.35)" }}
                    aria-label="Baixar Zupet para Android na Google Play"
                  >
                    <Image src="/stores/google-play.png" alt="Baixar Zupet no Google Play" width={140} height={42} className="h-8 w-auto" />
                  </TrackableStoreLink>
                  <TrackableStoreLink
                    store="ios"
                    href="https://apps.apple.com/br/app/zupet/id6793655564"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                    style={{ background: "oklch(0.15 0 0)", border: "1px solid oklch(0.30 0 0)", color: "white", boxShadow: "0 4px 20px oklch(0.15 0 0 / 0.5)" }}
                    aria-label="Baixar Zupet para iOS na App Store"
                  >
                    <Image src="/stores/app-store.svg" alt="Baixar Zupet na App Store" width={140} height={42} className="h-8 w-auto" />
                  </TrackableStoreLink>
                </div>
                <a
                  href="https://www.instagram.com/zupet.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs transition-colors hover:text-white"
                  style={{ color: "oklch(0.60 0 0)" }}
                >
                  Siga{" "}
                  <span style={{ color: "oklch(0.72 0 0)" }}>@zupet.io</span>{" "}
                  no Instagram
                </a>
              </div>

              <p className="mt-6 text-xs" style={{ color: "oklch(0.44 0 0)" }}>
                Gratuito • Sem compromisso • Funciona offline
              </p>
            </FadeUp>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <section className="py-28 px-6 relative overflow-hidden" style={{ background: "oklch(0.10 0 0)" }}>
          <div aria-hidden className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, oklch(0.50 0 0), transparent)" }} />
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-[1fr_1.6fr] gap-16 items-start">

              {/* Esquerda — label sticky */}
              <FadeUp className="lg:sticky lg:top-32">
                <p className="text-xs font-mono tracking-widest uppercase mb-4" style={{ color: "oklch(0.62 0.18 174)" }}>FAQ</p>
                <h2 className="font-heading text-4xl md:text-5xl font-bold leading-tight" style={{ color: "oklch(0.96 0 0)" }}>
                  Ficou com<br />alguma<br />dúvida?
                </h2>
                <p className="mt-5 text-sm leading-relaxed" style={{ color: "oklch(0.63 0 0)" }}>
                  As perguntas mais comuns dos tutores respondidas aqui.
                </p>
                <div className="mt-8 w-12 h-px" style={{ background: "oklch(0.62 0.18 174)" }} />
                <div className="mt-8 p-4 rounded-xl" style={{ background: "oklch(0.13 0 0)", border: "1px solid oklch(0.20 0 0)" }}>
                  <p className="text-xs font-medium mb-1" style={{ color: "oklch(0.75 0 0)" }}>Quer excluir sua conta?</p>
                  <p className="text-xs mb-3" style={{ color: "oklch(0.55 0 0)" }}>Acesse o formulário e solicite a remoção completa dos seus dados.</p>
                  <Link href="/excluir-conta" className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80" style={{ color: "oklch(0.62 0.18 174)" }}>
                    Solicitar exclusão de conta →
                  </Link>
                </div>
              </FadeUp>

              {/* Direita — perguntas */}
              <StaggerChildren stagger={0.06} className="flex flex-col">
                {[
                  { q: "O Zupet é gratuito?", a: "Sim, o download e uso básico são completamente gratuitos. Cadastre seus pets, registre vacinas, alimentação e fotos sem pagar nada." },
                  { q: "Funciona sem internet?", a: "Sim. O Zupet funciona em modo offline e sincroniza automaticamente quando você reconectar. Nunca perde dados." },
                  { q: "Quantos pets posso cadastrar?", a: "Quantos quiser. Cachorros, gatos, pássaros, coelhos — múltiplos pets e espécies na mesma conta." },
                  { q: "Meus dados são seguros?", a: "Sim. Dados criptografados e armazenados com segurança. Nunca compartilhamos informações pessoais com terceiros." },
                  { q: "Posso usar em mais de um dispositivo?", a: "Sim. Faça login com Google ou Apple em qualquer dispositivo e seus dados estarão sempre sincronizados." },
                  { q: "O Zupet está disponível para iOS?", a: "Sim! O Zupet está disponível para iPhone e iPad na App Store. Baixe gratuitamente em apps.apple.com/br/app/zupet/id6793655564" },
                  { q: "Como posso excluir minha conta e dados?", a: "Você pode excluir sua conta diretamente pelo app em Perfil → Configurações → Excluir conta, ou acessar nosso formulário online em zupet.io/excluir-conta. Todos os seus dados são removidos permanentemente em até 7 dias úteis." },
                ].map(({ q, a }, i) => (
                  <StaggerItem key={i}>
                    <div className="group py-6 border-b cursor-default"
                      style={{ borderColor: "oklch(0.18 0 0)" }}>
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm font-semibold leading-snug" style={{ color: "oklch(0.88 0 0)" }}>{q}</p>
                        <span className="text-xs font-mono mt-0.5 flex-shrink-0" style={{ color: "oklch(0.72 0 0)" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed" style={{ color: "oklch(0.68 0 0)" }}>{a}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </div>
          </div>
        </section>

        {/* ── CTA Final ───────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden" style={{ background: "oklch(0.115 0 0)" }}>
          {/* Linha topo */}
          <div aria-hidden className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, oklch(0.62 0.18 174 / 0.5), transparent)" }} />

          {/* Glow */}
          <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px]"
              style={{ background: "radial-gradient(ellipse, oklch(0.62 0.18 174 / 0.12) 0%, transparent 65%)", filter: "blur(50px)" }} />
          </div>

          <div className="max-w-6xl mx-auto px-6 py-28 relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Esquerda */}
              <FadeUp>
                <p className="text-xs font-mono tracking-widest uppercase mb-5" style={{ color: "oklch(0.62 0.18 174)" }}>
                  Comece agora
                </p>
                <h2 className="font-heading text-5xl md:text-6xl font-extrabold leading-[1.0] mb-6"
                  style={{ color: "oklch(0.97 0 0)" }}>
                  O seu pet<br />
                  <span style={{ color: "oklch(0.62 0.18 174)", textShadow: "0 0 60px oklch(0.62 0.18 174 / 0.35)" }}>
                    não pode esperar.
                  </span>
                </h2>
                <p className="text-base leading-relaxed mb-10" style={{ color: "oklch(0.68 0 0)" }}>
                  Junte-se a {hasStats ? stats.totalUsers.toLocaleString("pt-BR") : "milhares de"} tutores que já usam
                  o Zupet para manter seus pets saudáveis e felizes.
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <TrackableStoreLink
                      store="android"
                      href="https://play.google.com/store/apps/details?id=io.zupet.app&hl=pt_BR"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                      style={{ background: "oklch(0.62 0.18 174)", color: "white", boxShadow: "0 8px 40px oklch(0.62 0.18 174 / 0.4)" }}
                      aria-label="Baixar Zupet para Android na Google Play"
                    >
                      <Image src="/stores/google-play.png" alt="Baixar Zupet no Google Play" width={140} height={42} className="h-8 w-auto" />
                    </TrackableStoreLink>
                    <TrackableStoreLink
                      store="ios"
                      href="https://apps.apple.com/br/app/zupet/id6793655564"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                      style={{ background: "oklch(0.15 0 0)", border: "1px solid oklch(0.30 0 0)", color: "white", boxShadow: "0 4px 20px oklch(0.15 0 0 / 0.5)" }}
                      aria-label="Baixar Zupet para iOS na App Store"
                    >
                      <Image src="/stores/app-store.svg" alt="Baixar Zupet na App Store" width={140} height={42} className="h-8 w-auto" />
                    </TrackableStoreLink>
                  </div>
                  <div className="flex flex-col gap-1 text-xs" style={{ color: "oklch(0.60 0 0)" }}>
                    {["Grátis para download", "Google Play e App Store", "Funciona offline"].map(t => (
                      <div key={t} className="flex items-center gap-1.5">
                        <span style={{ color: "oklch(0.62 0.18 174)" }}>✓</span> {t}
                      </div>
                    ))}
                  </div>
                </div>
              </FadeUp>

              {/* Direita — mockup passaporte */}
              <ScaleIn delay={0.2} className="flex justify-center lg:justify-end">
                <div className="relative w-[220px]">
                  <div aria-hidden className="absolute inset-0"
                    style={{ background: "radial-gradient(ellipse, oklch(0.62 0.18 174 / 0.2) 0%, transparent 70%)", filter: "blur(24px)", transform: "scale(1.3)" }} />
                  <div className="relative"
                    style={{
                      borderRadius: "40px",
                      padding: "9px",
                      background: "linear-gradient(145deg, oklch(0.26 0 0), oklch(0.15 0 0))",
                      boxShadow: "0 40px 80px oklch(0 0 0 / 0.7), 0 0 0 1px oklch(0.70 0 0), inset 0 1px 0 oklch(0.32 0 0 / 0.5)",
                    }}>
                    <div className="absolute top-[16px] left-1/2 -translate-x-1/2 w-[70px] h-[20px] rounded-full z-10"
                      style={{ background: "oklch(0.11 0 0)" }} />
                    <div style={{ borderRadius: "32px", overflow: "hidden", aspectRatio: "9/19.5" }}>
                      <Image src="/screenshots/passaporte.png" alt="Zupet — Passaporte do pet"
                        width={220} height={476} className="w-full h-full object-cover object-top" />
                    </div>
                  </div>
                </div>
              </ScaleIn>
            </div>
          </div>
        </section>

        {/* ── Banner Walker ────────────────────────────────────────────────── */}
        <section style={{ background: "oklch(0.10 0.02 174)", borderTop: "1px solid oklch(0.18 0.04 174)" }}>
          <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0"
                style={{ background: "oklch(0.22 0.08 174)" }}>
                <Image src="/walker-icon.png" alt="Zupet Walker" width={48} height={48} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: "oklch(0.92 0 0)" }}>
                  Você é profissional de pets?
                </p>
                <p className="text-xs mt-0.5" style={{ color: "oklch(0.65 0.05 174)" }}>
                  Passeador, banhista, hospedeiro, adestredor — o Zupet Walker é o app para gerenciar seus atendimentos.
                </p>
              </div>
            </div>
            <a
              href="https://walker.zupet.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{ background: "oklch(0.62 0.18 174)", color: "#fff" }}
            >
              Conheça o Zupet Walker →
            </a>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer style={{ background: "oklch(0.09 0 0)", borderTop: "1px solid oklch(0.15 0 0)" }}>
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* Brand */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0"
                  style={{ boxShadow: "0 0 20px oklch(0.62 0.18 174 / 0.2)" }}>
                  <Image src="/icon.png" alt="Zupet" width={36} height={36} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-heading font-bold text-sm" style={{ color: "oklch(0.85 0 0)" }}>Zupet</p>
                  <p className="text-xs" style={{ color: "oklch(0.72 0 0)" }}>Cuidando quem você ama</p>
                </div>
              </div>
              {/* Copyright */}
              <p className="text-xs text-center" style={{ color: "oklch(0.70 0 0)" }}>
                © {new Date().getFullYear()} Zupet. Todos os direitos reservados.
              </p>
              {/* Links + Instagram */}
              <div className="flex justify-end items-center gap-5">
                <nav className="flex gap-5 text-xs" style={{ color: "oklch(0.60 0 0)" }}>
                  <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
                  <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
                  <Link href="/excluir-conta" className="hover:text-white transition-colors">Excluir conta</Link>
                  <Link href="/dashboard" className="hover:text-white transition-colors">Admin</Link>
                </nav>
                <a
                  href="https://www.instagram.com/zupet.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram do Zupet"
                  className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:scale-110"
                  style={{ background: "oklch(0.16 0 0)", border: "1px solid oklch(0.24 0 0)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "oklch(0.72 0 0)" }}>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </a>
              </div>
            </div>
            {/* Linha decorativa */}
            <div className="mt-10 pt-6 flex flex-col items-center gap-2" style={{ borderTop: "1px solid oklch(0.13 0 0)" }}>
              <p className="text-center text-xs font-mono" style={{ color: "oklch(0.60 0 0)" }}>
                feito com ❤️ para tutores que amam seus pets
              </p>
              <p className="text-center text-xs" style={{ color: "oklch(0.45 0 0)" }}>
                desenvolvido por{" "}
                <a
                  href="https://www.instagram.com/eduallochio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                  style={{ color: "oklch(0.58 0 0)" }}
                >
                  Eduardo Allochio
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
