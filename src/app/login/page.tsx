"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push(from);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Erro ao fazer login");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@zupet.com.br"
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Senha
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo + título */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md">
              <Image src="/icon.png" width={56} height={56} alt="Zupet" className="w-full h-full object-cover" />
            </div>
            <div className="text-muted-foreground text-xl font-light select-none">+</div>
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md bg-white flex items-center justify-center p-2">
              <Image src="/walker-icon.png" width={44} height={44} alt="Zupet Walker" className="object-contain" />
            </div>
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Zupet Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Painel administrativo</p>
        </div>

        <Suspense fallback={
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="space-y-4">
              <div className="h-10 bg-secondary rounded-lg animate-pulse" />
              <div className="h-10 bg-secondary rounded-lg animate-pulse" />
              <div className="h-10 bg-secondary rounded-lg animate-pulse" />
            </div>
          </div>
        }>
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Acesso restrito a administradores
        </p>
      </div>
    </div>
  );
}
