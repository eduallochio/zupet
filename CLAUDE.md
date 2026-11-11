@AGENTS.md

# Zupet Dashboard

Site zupet.io (landing + painel admin) e dashboard web do tutor.

## Stack e comandos

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/@base-ui, Supabase (`@supabase/supabase-js`), recharts, gsap, lenis, jose
- `npm run dev` | `npm run build` | `npm run lint`
- Código em `src/`, estáticos em `public/`

## Banco

O Supabase é compartilhado com o app Zupet. Nunca assumir nomes de colunas: consultar o schema real via MCP Supabase antes de escrever queries.

## Economia de tokens

- `CONTEXT.md` (~10 KB): não ler inteiro. Usar Grep pelos cabeçalhos `^##` e ler só a seção da tarefa.
- Next.js: consultar `node_modules/next/dist/docs/` só para a API específica em uso (Grep pelo termo), sem ler a pasta inteira.
- Não varrer `docs/` nem `banco/` sem necessidade. Pedido de código: ir direto aos arquivos citados.
