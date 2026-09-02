"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type AppType = "tutor" | "walker";

const APP_CONFIG: Record<AppType, {
  label: string;
  color: string;
  ring: string;
  icon: string;
  dataItems: string[];
  appPath: string;
}> = {
  tutor: {
    label: "Zupet Tutor",
    color: "#e87c3a",
    ring: "focus:ring-[#e87c3a]/30 focus:border-[#e87c3a]",
    icon: "🐾",
    dataItems: [
      "Perfil e informações da conta",
      "Dados de todos os pets cadastrados",
      "Diário, alimentação e registros de saúde",
      "Documentos e fotos armazenados",
      "Histórico de notificações e lembretes",
    ],
    appPath: "Perfil → Configurações → Excluir conta",
  },
  walker: {
    label: "Zupet Walker",
    color: "#00C6A7",
    ring: "focus:ring-[#00C6A7]/30 focus:border-[#00C6A7]",
    icon: "🦮",
    dataItems: [
      "Perfil e informações do walker",
      "Agenda e histórico de passeios",
      "Avaliações e conquistas",
      "Serviços cadastrados",
      "Histórico de pagamentos",
    ],
    appPath: "Perfil → Configurações → Excluir conta",
  },
};

export default function ExcluirContaPage() {
  const [app, setApp] = useState<AppType>("tutor");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const cfg = APP_CONFIG[app];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/deletion-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reason, app }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setStatus("duplicate");
        } else {
          setErrorMsg(data.error ?? "Erro ao enviar solicitação.");
          setStatus("error");
        }
        return;
      }

      setStatus("success");
    } catch {
      setErrorMsg("Erro de conexão. Tente novamente.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image src="/icon.png" alt="Zupet" width={32} height={32} className="rounded-lg" />
          <span className="font-semibold text-gray-900">Zupet</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">

          {status === "success" ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Solicitação recebida</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Recebemos sua solicitação de exclusão da conta <strong>{cfg.label}</strong>. Processaremos em até <strong>7 dias úteis</strong> e enviaremos uma confirmação para o seu email.
              </p>
              <p className="text-gray-400 text-xs mt-4">
                Caso tenha dúvidas, entre em contato: <a href="mailto:contato@zupet.io" className="text-[#e87c3a] hover:underline">contato@zupet.io</a>
              </p>
            </div>
          ) : status === "duplicate" ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Solicitação já existe</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Já existe uma solicitação em andamento para este email. Nossa equipe está processando o seu pedido.
              </p>
              <p className="text-gray-400 text-xs mt-4">
                Dúvidas? <a href="mailto:contato@zupet.io" className="text-[#e87c3a] hover:underline">contato@zupet.io</a>
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Excluir minha conta</h1>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Ao solicitar a exclusão, todos os seus dados serão permanentemente removidos. Esta ação não pode ser desfeita.
                </p>
              </div>

              {/* Seletor de app */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Qual app você quer excluir?</p>
                <div className="grid grid-cols-2 gap-3">
                  {(["tutor", "walker"] as AppType[]).map((a) => {
                    const c = APP_CONFIG[a];
                    const active = app === a;
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setApp(a)}
                        className="flex items-center gap-3 p-3 rounded-xl border-2 transition text-left"
                        style={{
                          borderColor: active ? c.color : "#e5e7eb",
                          backgroundColor: active ? c.color + "10" : "transparent",
                        }}
                      >
                        <span className="text-2xl">{c.icon}</span>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: active ? c.color : "#374151" }}>{c.label}</p>
                          <p className="text-xs text-gray-400">{a === "tutor" ? "App do tutor" : "App do walker"}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* O que será excluído */}
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                <p className="text-xs font-medium text-red-700 mb-2">Dados que serão excluídos ({cfg.label}):</p>
                <ul className="text-xs text-red-600 space-y-1">
                  {cfg.dataItems.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email da conta <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition ${cfg.ring}`}
                  />
                </div>

                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Conte-nos o motivo para melhorarmos o app..."
                    rows={3}
                    className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition resize-none ${cfg.ring}`}
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition"
                  style={{ backgroundColor: "#dc2626" }}
                >
                  {status === "loading" ? "Enviando..." : "Solicitar exclusão da conta"}
                </button>
              </form>

              <p className="text-xs text-gray-400 text-center mt-4">
                Prefere excluir pelo app? Vá em <strong>{cfg.appPath}</strong>.{" "}
                <Link href="/privacidade" className="hover:underline" style={{ color: cfg.color }}>Política de privacidade</Link>
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-400">
        © {new Date().getFullYear()} Zupet · <Link href="/privacidade" className="hover:underline">Privacidade</Link> · <Link href="/termos" className="hover:underline">Termos</Link>
      </footer>
    </div>
  );
}
