---
name: grill-me
description: Entrevista exigente para afiar um plano, uma feature ou um design antes de escrever código. Use quando o usuário pedir grill-me ou quando a tarefa for grande o bastante para que decisões erradas custem caro.
disable-model-invocation: true
---

<!-- Origem: github.com/rtadewald/skills (grill-me), adaptada. -->

# Grill me

Entreviste o usuário até chegarem a um entendimento comum do que será feito. Trate o plano como uma **árvore de decisões**: cada decisão abre as decisões que dependem dela.

## Rodadas

Trabalhe em rodadas. A **fronteira** é o conjunto de decisões cujos pré-requisitos já estão resolvidos: as perguntas que dá para fazer **agora**, sem chutar respostas que ainda não ouviu.

- Faça **uma pergunta por vez**. Espere a resposta antes da próxima.
- Cada resposta remodela a árvore: decisões resolvidas empurram a fronteira e liberam perguntas que dependiam delas.
- Uma pergunta cuja resposta depende de outra ainda aberta pertence a uma rodada **posterior**, não a esta.

Formato de cada pergunta:

```
❓ **P1 — <título da pergunta>**: <corpo, pode ter alternativas>

➡️ <sua recomendação>
```

A recomendação é obrigatória: o usuário precisa poder responder "pode ser" e seguir.

## Fatos são seu trabalho, decisões são do usuário

Quando a pergunta depende de um fato do ambiente (o que já existe no código, qual coluna a tabela tem, como a tela funciona hoje, o que a biblioteca suporta), **descubra você mesmo** — leia o código, consulte o banco, abra a documentação. Nunca pergunte ao usuário algo que dá para olhar.

Não trave: uma busca em andamento é um pré-requisito aberto, então só as perguntas que dependem dela esperam. Siga com o resto da fronteira.

Decisões de produto, de prioridade, de aparência e de risco são do usuário: apresente e espere.

## Fim

A entrevista acaba quando a fronteira está vazia: todos os ramos visitados, nada assumido em silêncio. Feche com um resumo curto do que ficou combinado (o que será feito, o que não será, e o que ficou de fora para depois) e **não comece a implementar** antes de o usuário confirmar.
