# Formato do relatório HTML

A revisão sai num HTML único e autocontido, na pasta temporária do sistema. Tailwind e Mermaid vêm de CDN. Mermaid resolve bem o que é grafo (chamadas, dependências, sequência); `div`s e SVG à mão resolvem o que é mais editorial (diagrama de massa, corte em camadas, colapso). Misture os dois: se tudo for Mermaid, o relatório fica genérico.

## Esqueleto

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Revisão de arquitetura — {{nome do projeto}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="module">
      import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
      mermaid.initialize({ startOnLoad: true, theme: "neutral", securityLevel: "loose" });
    </script>
    <style>
      .costura { stroke-dasharray: 4 4; }
      .vazamento { stroke: #dc2626; }
      .fundo { background: linear-gradient(135deg, #0f172a, #1e293b); }
    </style>
  </head>
  <body class="bg-stone-50 text-slate-900 font-sans">
    <main class="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <header>...</header>
      <section id="oportunidades" class="space-y-10">...</section>
      <section id="recomendacao">...</section>
    </main>
  </body>
</html>
```

## Cabeçalho

Nome do projeto, data e uma legenda curta: caixa sólida = módulo, linha tracejada = costura, seta vermelha = vazamento, caixa grossa escura = módulo fundo. Sem parágrafo de introdução: entre direto nas oportunidades.

## Cartão de oportunidade

Os diagramas carregam o peso. O texto é curto e usa o vocabulário da skill.

Cada oportunidade é um `<article>`:

- **Título**: curto, nomeia o aprofundamento ("Juntar a entrada de OS num módulo só").
- **Selos**: força da recomendação (`Forte` = esmeralda, `Vale explorar` = âmbar, `Especulativa` = ardósia).
- **Arquivos**: lista em `font-mono text-sm`.
- **Antes / depois**: duas colunas lado a lado. É o centro do cartão.
- **Problema**: uma frase.
- **Solução**: uma frase.
- **Ganhos**: itens de até seis palavras.
- **Aviso** (quando contraria uma decisão registrada em `docs/adr/`): uma linha numa caixa âmbar.

Sem parágrafos de explicação. Se o diagrama precisa de um parágrafo para ser entendido, redesenhe o diagrama.

## Padrões de diagrama

Escolha o que serve para cada caso e varie entre os cartões.

**Grafo Mermaid** (o mais usado: dependências e fluxo de chamadas) — quando a mensagem é "A chama B que chama C, e olha a bagunça":

```html
<div class="rounded-lg border border-slate-200 bg-white p-4">
  <pre class="mermaid">
    flowchart LR
      A[FormularioOS] --> B[validaOS]
      B --> C[repositorioOS]
      C -.vaza.-> D[clientePreco]
      classDef vazamento stroke:#dc2626,stroke-width:2px;
      class C,D vazamento
  </pre>
</div>
```

**Caixas e setas à mão** — quando o "depois" precisa de uma caixa grossa única com o miolo esmaecido, peso que o Mermaid não dá. Módulos como `div` com borda; setas em SVG posicionado sobre um container relativo.

**Corte em camadas** — bom para rasura empilhada. Faixas horizontais (`h-12 border-l-4`) mostrando por quantas camadas a chamada passa. Antes: seis faixas finas, cada uma sem fazer quase nada. Depois: uma faixa grossa com a responsabilidade inteira.

**Diagrama de massa** — bom para "interface quase do tamanho da implementação". Dois retângulos por módulo, um para a interface e outro para a implementação. Antes: quase da mesma altura. Depois: interface baixa, implementação alta.

**Colapso do grafo de chamadas** — antes: árvore de caixas aninhadas. Depois: a mesma árvore dentro de uma caixa só, com as chamadas agora internas esmaecidas.

## Estilo

- Editorial, não painel corporativo. Espaço em branco generoso. Serifada nos títulos combina com stone/slate.
- Pouca cor: um destaque (esmeralda ou índigo), vermelho só para vazamento e âmbar só para aviso.
- Diagramas com cerca de 320px de altura, para antes e depois caberem lado a lado sem rolar.
- Rótulo de módulo dentro do diagrama em `text-xs uppercase tracking-wider`, para ler como esquema e não como interface de produto.
- Os únicos scripts são o Tailwind e o Mermaid. O resto é estático.

## Recomendação principal

Um cartão maior: nome da oportunidade, uma frase de porquê e um link âncora para o cartão dela. Só isso.

## Tom

Direto e curto, com os substantivos e verbos do vocabulário da skill.

**Use:** módulo, interface, implementação, profundidade, fundo, raso, costura, adaptador, alavanca, localidade.

**Não troque por:** componente, serviço, unidade (no lugar de módulo) · API, assinatura (no lugar de interface) · fronteira (no lugar de costura) · camada, wrapper (no lugar de módulo).

Frases no tom certo:

- "A entrada de OS é rasa: a interface é quase do tamanho da implementação."
- "O cálculo de preço vaza pela costura."
- "Aprofundar: uma interface, um lugar para testar."
- "Dois adaptadores justificam a costura: HTTP em produção, memória no teste."

Nos **ganhos**, nomeie o ganho no vocabulário: *"localidade: o bug concentra num módulo"*, *"alavanca: uma interface, N pontos de uso"*, *"a interface encolhe; a implementação absorve os wrappers"*. Não escreva "mais fácil de manter" nem "código mais limpo": não dizem nada.
