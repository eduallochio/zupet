import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Termos de Uso — Zupet",
  description: "Termos de uso do aplicativo Zupet. Leia as condições para utilizar nosso app.",
  alternates: { canonical: "/termos" },
  robots: { index: true, follow: true },
};

export default function TermosPage() {
  return (
    <div style={{ background: "oklch(0.10 0 0)", color: "oklch(0.92 0 0)", minHeight: "100vh" }}>
      {/* Nav */}
      <header className="border-b" style={{ borderColor: "oklch(0.18 0 0)", background: "oklch(0.10 0 0 / 0.95)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/icon.png" alt="Zupet" width={28} height={28} className="rounded-lg" />
            <span className="font-bold text-base" style={{ color: "oklch(0.97 0 0)" }}>Zupet</span>
          </Link>
          <Link href="/privacidade" className="text-sm transition-colors" style={{ color: "oklch(0.65 0 0)" }}>
            Política de Privacidade
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14">
        <p className="text-xs font-mono tracking-widest uppercase mb-4" style={{ color: "oklch(0.62 0.18 174)" }}>
          Legal
        </p>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "oklch(0.97 0 0)" }}>
          Termos de Uso
        </h1>
        <p className="text-sm mb-10" style={{ color: "oklch(0.55 0 0)" }}>
          Última atualização: 10 de abril de 2026
        </p>

        <div className="space-y-10 text-sm leading-relaxed" style={{ color: "oklch(0.78 0 0)" }}>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>1. Aceitação dos termos</h2>
            <p>
              Ao instalar e usar o aplicativo Zupet, você concorda com estes Termos de Uso.
              Se não concordar com algum ponto, não utilize o app.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>2. Descrição do serviço</h2>
            <p>
              O Zupet é um aplicativo gratuito para gestão de saúde e cuidados de animais de estimação,
              disponível para Android e iOS. Oferece funcionalidades como histórico de saúde, vacinas,
              alimentação, fotos, lembretes e sincronização entre dispositivos.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>3. Uso permitido</h2>
            <p className="mb-3">Você pode usar o Zupet para:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Gerenciar informações dos seus próprios pets</li>
              <li>Compartilhar fotos e conquistas dos seus animais</li>
              <li>Configurar lembretes de saúde e alimentação</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>4. Uso proibido</h2>
            <p className="mb-3">É proibido usar o Zupet para:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Compartilhar conteúdo ofensivo, ilegal ou que promova maus-tratos a animais</li>
              <li>Tentar acessar dados de outros usuários</li>
              <li>Realizar engenharia reversa ou modificar o app</li>
              <li>Usar de forma automatizada (bots, scripts)</li>
              <li>Fins comerciais sem autorização prévia</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>5. Conta e responsabilidade</h2>
            <p>
              Você é responsável por manter a segurança da sua conta e por todas as atividades
              realizadas com ela. Notifique-nos imediatamente em caso de uso não autorizado.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>6. Conteúdo do usuário</h2>
            <p>
              Você mantém a propriedade de todo conteúdo que cadastra no app (fotos, registros, etc.).
              Ao usar o Zupet, você nos concede licença limitada para armazenar e exibir seu conteúdo
              exclusivamente para o funcionamento do serviço.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>7. Anúncios</h2>
            <p>
              O app exibe anúncios do Google AdMob para se manter gratuito. Os anúncios são fornecidos
              por terceiros e estão sujeitos às políticas do Google. Não nos responsabilizamos pelo
              conteúdo dos anúncios exibidos.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>8. Disponibilidade</h2>
            <p>
              Nos esforçamos para manter o app disponível 24/7, mas não garantimos disponibilidade
              ininterrupta. Podemos realizar manutenções que causem indisponibilidade temporária.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>9. Limitação de responsabilidade</h2>
            <p>
              O Zupet fornece informações para auxiliar o tutor, mas não substitui orientação veterinária
              profissional. Não nos responsabilizamos por decisões tomadas com base nas informações do app.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>10. Encerramento de conta</h2>
            <p>
              Você pode encerrar sua conta a qualquer momento nas configurações do app.
              Podemos suspender contas que violem estes termos. Ao encerrar, seus dados
              serão removidos conforme nossa{" "}
              <Link href="/privacidade" className="underline" style={{ color: "oklch(0.62 0.18 174)" }}>
                Política de Privacidade
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>11. Alterações nos termos</h2>
            <p>
              Podemos atualizar estes termos. Notificaremos sobre mudanças significativas via
              notificação no app. O uso continuado após alterações implica aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>12. Lei aplicável</h2>
            <p>
              Estes termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de
              domicílio do usuário para resolução de conflitos.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3" style={{ color: "oklch(0.95 0 0)" }}>13. Contato</h2>
            <p>
              Dúvidas sobre estes termos? Entre em contato:<br />
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
            <Link href="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
