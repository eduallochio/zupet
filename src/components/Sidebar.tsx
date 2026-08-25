"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  PawPrint,
  Activity,
  BarChart3,
  Store,
  Globe,
  LogOut,
  Trash2,
  Menu,
  X,
  TrendingUp,
  LineChart,
  ShieldCheck,
  GitMerge,
  MapPin,
  Bell,
  Syringe,
  Weight,
  Pill,
  Phone,
  BookOpen,
  FileText,
  Utensils,
  ClipboardList,
  ChevronDown,
  Heart,
  Footprints,
  Route,
  Wrench,
  Star,
  Banknote,
  AlertTriangle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

type NavItem = { href: string; label: string; icon: React.ElementType };
type NavGroup = { label: string; icon: React.ElementType; items: NavItem[]; defaultOpen?: boolean };

const pinnedItems: NavItem[] = [
  { href: "/dashboard", label: "Visão Geral Zupet", icon: LayoutDashboard },
  { href: "/dashboard/walker/overview", label: "Visão Geral Walker", icon: Footprints },
  { href: "/dashboard/users", label: "Usuários", icon: Users },
  { href: "/dashboard/pets", label: "Pets", icon: PawPrint },
];

const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    icon: BarChart3,
    defaultOpen: false,
    items: [
      { href: "/dashboard/analytics", label: "Análises", icon: BarChart3 },
      { href: "/dashboard/activity", label: "Atividade", icon: Activity },
      { href: "/dashboard/retention", label: "Retenção", icon: TrendingUp },
      { href: "/dashboard/usage", label: "Uso do App", icon: LineChart },
      { href: "/dashboard/funnel", label: "Funil", icon: GitMerge },
      { href: "/dashboard/geo", label: "Geografia", icon: MapPin },
    ],
  },
  {
    label: "Saúde dos Pets",
    icon: Heart,
    defaultOpen: false,
    items: [
      { href: "/dashboard/vaccinations", label: "Vacinações", icon: Syringe },
      { href: "/dashboard/weight", label: "Peso", icon: Weight },
      { href: "/dashboard/medications", label: "Medicamentos", icon: Pill },
      { href: "/dashboard/prescriptions", label: "Prescrições", icon: ClipboardList },
      { href: "/dashboard/emergency-contacts", label: "Emergência", icon: Phone },
    ],
  },
  {
    label: "Rotina",
    icon: Bell,
    defaultOpen: false,
    items: [
      { href: "/dashboard/reminders", label: "Lembretes", icon: Bell },
      { href: "/dashboard/feedings", label: "Alimentação", icon: Utensils },
      { href: "/dashboard/diary", label: "Diário", icon: BookOpen },
      { href: "/dashboard/documents", label: "Documentos", icon: FileText },
    ],
  },
  {
    label: "Walker",
    icon: Footprints,
    defaultOpen: false,
    items: [
      { href: "/dashboard/walker/walkers", label: "Walkers", icon: Users },
      { href: "/dashboard/walker/passeios", label: "Passeios", icon: Route },
      { href: "/dashboard/walker/servicos", label: "Serviços", icon: Wrench },
      { href: "/dashboard/walker/avaliacoes", label: "Avaliações", icon: Star },
      { href: "/dashboard/walker/pagamentos", label: "Pagamentos", icon: Banknote },
      { href: "/dashboard/walker/erros", label: "Erros", icon: AlertTriangle },
    ],
  },
  {
    label: "Plataforma",
    icon: ShieldCheck,
    defaultOpen: false,
    items: [
      { href: "/dashboard/health", label: "Saúde da Base", icon: ShieldCheck },
      { href: "/dashboard/alerts", label: "Alertas", icon: Bell },
      { href: "/dashboard/stores", label: "Lojas", icon: Store },
      { href: "/dashboard/landing", label: "Landing Page", icon: Globe },
      { href: "/dashboard/deletions", label: "Exclusões", icon: Trash2 },
    ],
  },
];

function NavLink({ href, label, icon: Icon, onClick }: NavItem & { onClick?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      )}
    >
      <Icon className={cn("h-4 w-4 flex-shrink-0", active ? "text-primary" : "text-muted-foreground")} />
      {label}
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
    </Link>
  );
}

function NavGroupSection({
  group,
  onClose,
}: {
  group: NavGroup;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const hasActive = group.items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );
  const [open, setOpen] = useState(group.defaultOpen || hasActive);
  const GroupIcon = group.icon;

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
          hasActive
            ? "text-primary font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        )}
      >
        <GroupIcon className={cn("h-4 w-4 flex-shrink-0", hasActive ? "text-primary" : "text-muted-foreground")} />
        <span className="flex-1 text-left">{group.label}</span>
        {hasActive && !open && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200",
            open ? "rotate-180" : "",
            hasActive ? "text-primary" : "text-muted-foreground"
          )}
        />
      </button>

      {open && (
        <div className="mt-0.5 ml-3 pl-3 border-l border-border space-y-0.5">
          {group.items.map((item) => (
            <NavLink key={item.href} {...item} onClick={onClose} />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col h-full border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 gap-3">
        <Image src="/icon.png" alt="Zupet" width={32} height={32} className="rounded-xl flex-shrink-0" />
        <span className="font-heading font-700 text-lg tracking-tight text-foreground">Zupet</span>
        <span className="ml-auto text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          admin
        </span>
        {onClose && (
          <button onClick={onClose} className="ml-2 text-muted-foreground hover:text-foreground md:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <Separator className="opacity-50" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {/* Itens fixos */}
        {pinnedItems.map((item) => (
          <NavLink key={item.href} {...item} onClick={onClose} />
        ))}

        <div className="py-1.5">
          <Separator className="opacity-30" />
        </div>

        {/* Grupos colapsáveis */}
        {navGroups.map((group) => (
          <NavGroupSection key={group.label} group={group} onClose={onClose} />
        ))}
      </nav>

      <Separator className="opacity-50" />

      {/* Logout */}
      <div className="p-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Sair
        </button>
      </div>

      <Separator className="opacity-50" />
      <div className="p-4 flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-primary">A</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground truncate">Administrador</p>
          <p className="text-[10px] text-muted-foreground truncate">Zupet Dashboard</p>
        </div>
      </div>
    </aside>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-background border border-border shadow-sm"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {/* Mobile backdrop */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 h-full transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent onClose={() => setOpen(false)} />
      </div>
    </>
  );
}
