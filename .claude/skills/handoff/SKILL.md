---
name: handoff
description: Resume a conversa atual num documento de passagem para outra sessão continuar o trabalho. Use quando o usuário pedir handoff, quando a sessão estiver longa ou antes de trocar de máquina ou de ferramenta.
argument-hint: "No que a próxima sessão vai trabalhar?"
disable-model-invocation: true
---

<!-- Origem: github.com/rtadewald/skills (handoff), adaptada. -->

# Handoff

Escreva um documento de passagem que permita a uma sessão nova continuar de onde esta parou, sem reler a conversa.

Salve em `docs/handoff/AAAA-MM-DD-<assunto>.md` dentro do projeto. Se o usuário não quiser nada novo no repositório, salve na pasta temporária do sistema e informe o caminho completo.

Se o usuário passou um argumento, trate-o como o foco da próxima sessão e escreva o documento para esse foco.

## O que entra

- **Objetivo**: o que se está tentando alcançar, em duas ou três frases.
- **Estado atual**: o que já está pronto, em qual branch, com quais commits (hash curto + assunto). O que está só no disco e ainda não foi commitado.
- **Decisões tomadas**: cada uma em uma linha, com o motivo. Inclua as recusadas ("não vamos fazer X porque..."), que é o que impede a próxima sessão de refazer a discussão.
- **O que falta**: a lista em ordem, com o próximo passo bem concreto.
- **Armadilhas**: o que já deu errado nesta sessão e como contornar (comando que trava, build que falha, campo com nome diferente do esperado).
- **Como testar**: os comandos exatos e o que olhar na tela.
- **Skills sugeridas**: quais skills a próxima sessão deve chamar, pelo nome.

## O que não entra

- Conteúdo que já está em outro artefato: plano, spec, issue, commit, diff, CONTEXT.md. Cite o caminho ou a URL em vez de copiar.
- Narrativa da conversa ("então eu tentei, aí você pediu..."). Só o estado e as conclusões.
- Chave de API, senha, token, dado de cartão, CPF, telefone ou qualquer dado pessoal. Se precisar citar, escreva o nome da variável de ambiente, não o valor.

Termine informando o caminho do arquivo em uma linha.
