---
name: to-tickets
description: Quebra um plano, uma spec ou a conversa atual em tickets verticais, cada um declarando o que o bloqueia, salvos como arquivos em docs/tickets/. Use quando o usuário pedir to-tickets ou quando a tarefa for grande demais para uma sessão só.
disable-model-invocation: true
---

<!-- Origem: github.com/rtadewald/skills (to-tickets), adaptada para tickets locais. -->

# To tickets

Quebre o trabalho em **tickets**: fatias verticais, cada uma declarando quais outras precisam estar prontas antes.

## 1. Reunir contexto

Trabalhe com o que já está na conversa. Se o usuário passar uma referência (caminho de um plano, número de issue, URL), abra e leia por inteiro.

## 2. Olhar o código

Se ainda não explorou o código, explore agora: os títulos e as descrições devem usar os nomes reais do projeto (tabelas, rotas, componentes), não nomes inventados. Procure também o que dá para preparar antes para o resto ficar fácil ("torne a mudança fácil, depois faça a mudança fácil").

## 3. Fatiar na vertical

Cada ticket é uma **fatia vertical**:

- corta um caminho estreito, porém **completo**, por todas as camadas que a mudança toca (banco, API, tela, teste);
- entrega algo que dá para **demonstrar ou verificar sozinho** — não "só o backend";
- cabe numa sessão limpa, sem precisar de todo o contexto anterior;
- o que for preparação vem primeiro.

Dê a cada ticket as suas **dependências**: os tickets que precisam terminar antes. Ticket sem dependência pode começar já.

**Refatoração ampla é a exceção.** Quando uma mudança mecânica (renomear uma coluna, trocar o tipo de um campo usado em todo lugar) quebra centenas de pontos de uma vez, nenhuma fatia vertical fecha verde. Nesse caso use **expandir e contrair**:

1. **Expandir**: criar a forma nova ao lado da antiga, sem quebrar nada.
2. **Migrar**: mover os pontos de uso em lotes (por pasta, por módulo), cada lote um ticket bloqueado pelo expandir. Como a forma antiga ainda existe, cada lote fecha verde.
3. **Contrair**: apagar a forma antiga quando ninguém mais a usa, bloqueado por todos os lotes.

## 4. Conferir com o usuário

Apresente a lista numerada. Para cada ticket mostre:

- **Título**: curto e específico.
- **Bloqueado por**: quais tickets precisam vir antes.
- **O que entrega**: o comportamento que passa a funcionar de ponta a ponta.

E pergunte:

- O tamanho está bom (grande demais, pequeno demais)?
- As dependências estão certas, ou tem ticket esperando algo que não precisa esperar?
- Algum deve ser juntado ou dividido?

Ajuste até o usuário aprovar. **Não crie os arquivos antes da aprovação.**

## 5. Salvar

Um arquivo por ticket em `docs/tickets/`, numerado na ordem em que podem começar:

```
docs/tickets/01-<slug>.md
```

Com este formato:

```markdown
# 01 — <título>

**Status:** aberto
**Bloqueado por:** —            <!-- ou: 02, 03 -->
**Entrega:** <o comportamento que passa a funcionar>

## Contexto
<por que este ticket existe, em 2 ou 3 linhas; cite o plano ou a conversa de origem>

## Passos
- [ ] <passo concreto, no vocabulário do projeto>
- [ ] <...>

## Como verificar
<o comando a rodar e o que olhar na tela>
```

No fim, escreva no chat a ordem sugerida de execução e quais tickets podem rodar em paralelo.
