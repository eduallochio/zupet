---
name: improve-codebase-architecture
description: Varre o código atrás de pontos onde a arquitetura atrapalha, apresenta as oportunidades num relatório HTML visual e aprofunda a que o usuário escolher. Use quando o usuário pedir improve-codebase-architecture, uma revisão de arquitetura ou disser que mexer em certa parte do código está difícil.
disable-model-invocation: true
---

<!-- Origem: github.com/rtadewald/skills (improve-codebase-architecture), adaptada: vocabulário embutido e sem dependência de outras skills. -->

# Revisar a arquitetura do código

Encontre atrito arquitetural e proponha **aprofundamentos**: mudanças que transformam módulos rasos em módulos fundos. O objetivo é o código ficar mais fácil de testar e mais fácil de navegar — por você e por quem vier depois.

## Vocabulário

Use estes termos, sempre com este sentido. Não troque por "componente", "serviço", "camada" ou "boundary".

- **Módulo**: um pedaço de código com uma interface e uma implementação. Um arquivo, uma pasta, uma função exportada.
- **Interface**: tudo o que quem usa o módulo precisa saber — assinatura, parâmetros, efeitos colaterais, ordem de chamada, erros possíveis.
- **Profundidade**: quanto a implementação entrega em relação ao tamanho da interface. Módulo **fundo** esconde muito atrás de pouco. Módulo **raso** tem interface quase do tamanho da implementação e só repassa trabalho.
- **Costura (seam)**: o ponto onde dá para trocar uma implementação por outra sem mexer em quem chama. É onde o teste entra.
- **Adaptador**: a implementação concreta por trás de uma costura (o cliente do Supabase, o cliente do Asaas, o armazenamento local).
- **Alavanca**: quanto uma mudança pequena no módulo resolve de uma vez no resto do sistema.
- **Localidade**: quanto do raciocínio sobre um assunto cabe em um lugar só. Quando entender uma regra exige pular por seis arquivos, a localidade está ruim.

Dois testes rápidos:

- **Teste da deleção**: se eu apagar este módulo e colar o conteúdo dele em quem chama, a complexidade **concentra** (sinal de que o módulo era raso e atrapalhava) ou **espalha** (sinal de que ele estava ganhando algo)? Procure os "concentra".
- **A interface é a superfície de teste**: se para testar uma regra é preciso exportar função interna, mexer em variável global ou simular cinco coisas, a costura está no lugar errado.

## Processo

### 1. Explorar

**Escolha onde olhar antes de olhar.** Aprofundar só se paga na parte do código que vai mudar de novo:

- Se o usuário apontou uma direção (um módulo, uma tela, uma dor), siga a dele e pule o resto deste passo.
- Senão, olhe o histórico (`git log --oneline` de uns meses) e veja quais arquivos aparecem sempre. Esses puxam a atenção primeiro. Se as mudanças estiverem espalhadas, abra o leque.

Leia antes o `CONTEXT.md` (ou `CLAUDE.md` / `GLOSSARY.md`) do projeto, para usar os nomes reais do domínio.

Depois percorra o código procurando atrito — sem seguir checklist rígido:

- Onde entender **um** assunto exige pular entre muitos arquivos pequenos?
- Onde a interface é quase do tamanho da implementação?
- Onde funções foram extraídas "para testar", mas o bug real mora em **como** elas são chamadas?
- Onde dois módulos vazam um no outro (um sabe demais sobre o de dentro do outro)?
- O que não tem teste, ou é difícil de testar pela interface de hoje?
- Onde a mesma regra de negócio está escrita em dois ou três lugares, podendo divergir?

Aplique o teste da deleção em tudo que parecer raso.

### 2. Apresentar as oportunidades num relatório HTML

Escreva um HTML único e autocontido na pasta temporária do sistema, para não sujar o repositório: use `$TMPDIR` (ou `/tmp`, ou `%TEMP%` no Windows) e o nome `revisao-arquitetura-<timestamp>.html`. Informe o caminho completo ao usuário e abra o arquivo quando der (`xdg-open`, `open` ou `start`).

Veja [HTML-REPORT.md](HTML-REPORT.md) para o esqueleto, os padrões de diagrama e o estilo.

Para cada oportunidade, um cartão com:

- **Arquivos**: quais módulos estão envolvidos.
- **Problema**: uma frase. O que dói hoje.
- **Solução**: uma frase. O que muda.
- **Ganhos**: itens curtos, em termos de localidade, alavanca e teste ("o teste passa a bater numa interface só", "apaga 4 wrappers rasos").
- **Antes / depois**: dois diagramas lado a lado mostrando a rasura e o aprofundamento. É a parte principal do cartão.
- **Força da recomendação**: `Forte`, `Vale explorar` ou `Especulativa`, como selo.

Termine com uma seção **Recomendação principal**: qual você faria primeiro e por quê.

Não proponha ainda a interface nova. Depois de escrever o arquivo, pergunte: "qual delas você quer explorar?"

### 3. Aprofundar a escolhida

Quando o usuário escolher, chame a skill `grill-me` para percorrer as decisões com ele: restrições, dependências, o formato do módulo aprofundado, o que fica atrás da costura, quais testes sobrevivem e quais somem.

Conforme as decisões fecham:

- Se o módulo novo ganhar um nome que não existe no `CONTEXT.md`/`GLOSSARY.md` do projeto, acrescente o termo lá (crie o arquivo se não existir).
- Se o usuário recusar a ideia por um motivo que vale guardar, ofereça registrar em `docs/adr/` em três linhas (decisão, motivo, data), para a próxima revisão não sugerir de novo. Só ofereça quando o motivo for duradouro; motivo do tipo "agora não dá tempo" não vira registro.

Depois do combinado, a implementação pode virar tickets com a skill `to-tickets` — principalmente se for refatoração ampla, que pede expandir e contrair.
