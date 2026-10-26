import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Política de Privacidade — Zupet",
  description: "Política de privacidade do aplicativo Zupet. Saiba como coletamos, usamos e protegemos seus dados.",
  alternates: { canonical: "/privacidade" },
  robots: { index: true, follow: true },
};

export default function PrivacidadePage() {
  return (
    <div style={{ background: "oklch(0.10 0 0)", color: "oklch(0.92 0 0)", minHeight: "100vh" }}>
      {/* Nav */}
      <header className="border-b" style={{ borderColor: "oklch(0.18 0 0)", background: "oklch(0.10 0 0 / 0.95)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/icon.png" alt="Zupet" width={28} height={28} className="rounded-lg" />
            <span className="font-bold text-base" style={{ color: "oklch(0.97 0 0)" }}>Zupet</span>
          </Link>
          <Link href="/termos" className="text-sm transition-colors" style={{ color: "oklch(0.65 0 0)" }}>
            Termos de Uso
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14">
        <p className="text-xs font-mono tracking-widest uppercase mb-4" style={{ color: "oklch(0.62 0.18 174)" }}>
          Legal
        </p>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "oklch(0.97 0 0)" }}>
          Política de Privacidade
        </h1>
        <p className="text-sm mb-10" style={{ color: "oklch(0.55 0 0)" }}>
          Última atualização: 10 de abril de 2026
        </p>

        <div className="space-y-10 text-sm leading-relaxed" style={{ color: "oklch(0.78 0 0)" }}>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>1. Quem somos</h2>
            <p>
              O Zupet é um aplicativo móvel desenvolvido por <strong>Omegasistem</strong> para ajudar tutores a gerenciar
              a saúde, alimentação, vacinas, fotos e lembretes de seus animais de estimação.
              Nosso site é <a href="https://zupet.io" className="underline" style={{ color: "oklch(0.62 0.18 174)" }}>zupet.io</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>2. Dados que coletamos</h2>
            <p className="mb-3">Coletamos apenas os dados necessários para o funcionamento do app:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Dados de conta:</strong> e-mail, nome e foto de perfil (via login Google ou Apple)</li>
              <li><strong>Dados dos pets:</strong> nome, espécie, raça, data de nascimento, peso e foto</li>
              <li><strong>Dados de saúde:</strong> vacinas, consultas, medicamentos e exames registrados por você</li>
              <li><strong>Fotos:</strong> imagens dos seus pets que você opta por salvar no app</li>
              <li><strong>Lembretes:</strong> datas e descrições de eventos que você cadastra</li>
              <li><strong>Dados de uso:</strong> informações anônimas sobre como o app é utilizado, para melhorias</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>3. Como usamos seus dados</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Sincronizar seus dados entre dispositivos</li>
              <li>Enviar notificações de lembretes que você configurou</li>
              <li>Melhorar a experiência e funcionalidades do app</li>
              <li>Exibir anúncios relevantes via Google AdMob (veja seção 6)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>4. Compartilhamento de dados</h2>
            <p className="mb-3">
              Não vendemos seus dados pessoais. Compartilhamos apenas com prestadores de serviço essenciais:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Supabase:</strong> armazenamento seguro dos dados na nuvem</li>
              <li><strong>Google Firebase / AdMob:</strong> autenticação e exibição de anúncios</li>
              <li><strong>Apple Sign In:</strong> autenticação opcional via Apple ID</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>5. Armazenamento e segurança</h2>
            <p>
              Seus dados são armazenados com criptografia em servidores seguros (Supabase / AWS).
              Utilizamos Row Level Security (RLS) para garantir que você só acessa seus próprios dados.
              Nenhum funcionário tem acesso direto ao conteúdo dos seus pets.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>6. Anúncios (Google AdMob)</h2>
            <p className="mb-3">
              O Zupet exibe anúncios fornecidos pelo Google AdMob para manter o app gratuito.
              O Google pode usar dados de uso para exibir anúncios personalizados com base nos seus interesses.
              Você pode optar por não receber anúncios personalizados nas configurações do seu dispositivo:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Android:</strong> Configurações → Google → Anúncios → Desativar personalização</li>
              <li>Saiba mais em <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "oklch(0.62 0.18 174)" }}>policies.google.com/technologies/ads</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>7. Seus direitos (LGPD)</h2>
            <p className="mb-3">Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Acessar os dados que temos sobre você</li>
              <li>Corrigir dados incorretos</li>
              <li>Solicitar a exclusão de todos os seus dados</li>
              <li>Revogar consentimento a qualquer momento</li>
              <li>Portabilidade dos seus dados</li>
            </ul>
            <p className="mt-3">
              Para solicitar a exclusão da sua conta e dados, use nosso formulário:{" "}
              <a href="/excluir-conta" className="underline font-medium" style={{ color: "oklch(0.62 0.18 174)" }}>
                zupet.io/excluir-conta
              </a>
            </p>
            <p className="mt-2">
              Para demais direitos, entre em contato:{" "}
              <a href="mailto:eduallochio2@outlook.com" className="underline" style={{ color: "oklch(0.62 0.18 174)" }}>
                eduallochio2@outlook.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>8. Retenção de dados</h2>
            <p>
              Mantemos seus dados enquanto sua conta estiver ativa. Ao solicitar exclusão da conta,
              todos os dados pessoais são removidos permanentemente em até 30 dias.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>9. Crianças</h2>
            <p>
              O Zupet não é direcionado a menores de 13 anos. Não coletamos intencionalmente dados de crianças.
              Se identificarmos que uma conta pertence a menor de 13 anos, os dados serão removidos.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>10. Alterações nesta política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas
              via notificação no app ou e-mail. O uso continuado do app após alterações implica aceitação.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>11. Contato</h2>
            <p>
              Dúvidas sobre privacidade? Fale conosco:<br />
              <a href="mailto:eduallochio2@outlook.com" className="underline" style={{ color: "oklch(0.62 0.18 174)" }}>eduallochio2@outlook.com</a><br />
              <a href="https://zupet.io" className="underline" style={{ color: "oklch(0.62 0.18 174)" }}>zupet.io</a>
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t mt-10" style={{ borderColor: "oklch(0.15 0 0)" }}>
        <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs" style={{ color: "oklch(0.50 0 0)" }}>
          <p>© {new Date().getFullYear()} Zupet. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link href="/excluir-conta" className="hover:text-white transition-colors">Excluir conta</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
