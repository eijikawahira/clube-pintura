# Clube de Pintura

Site para organizar o clube de pintura de miniaturas: login por participante,
próximo encontro, preparativos e qual miniatura cada um vai pintar.

## Stack

Next.js (App Router) + TypeScript, SQLite (`better-sqlite3`), Auth.js
(NextAuth v5) com login usuário/senha, Tailwind CSS.

## Rodando localmente

```bash
npm install
cp .env.example .env.local
openssl rand -base64 32   # cole o resultado em AUTH_SECRET no .env.local

npm run db:migrate
npm run db:seed-admin     # cria o primeiro usuário admin (prompt interativo)

npm run dev                # http://localhost:3000
```

Faça login com o usuário admin criado acima. Como admin você pode:

- **Encontros** — cadastrar data, horário e endereço (com autocomplete do
  Google Maps, se configurado) do próximo encontro, e os preparativos.
- **Participantes** — criar login para cada pessoa do clube (senha inicial,
  reset de senha, remover).
- **Miniaturas** — catálogo com nome, dimensões, imagem e estoque de cada
  miniatura.
- **Atribuições** — para um encontro, definir qual miniatura cada participante
  vai pintar (respeitando o estoque disponível).

Cada participante, ao logar, só vê o próximo encontro, os preparativos (como
checklist marcável), a miniatura atribuída a ele com imagem, e um botão para
baixar um arquivo `.ics` e adicionar o encontro ao próprio calendário — sem
acesso às telas de admin.

Para ativar o autocomplete de endereço, veja a variável
`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` no `.env.example`.

## Deploy

Veja [`deploy/DEPLOY.md`](deploy/DEPLOY.md) para o passo a passo de deploy num
servidor Rocky Linux com PM2 + Nginx.

## Scripts úteis

- `npm run dev` — servidor de desenvolvimento
- `npm run build` / `npm run start` — build e start de produção
- `npm run db:migrate` — cria/atualiza as tabelas do SQLite
- `npm run db:seed-admin` — cria um usuário admin via terminal
