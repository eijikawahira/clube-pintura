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

- **Encontros** — cadastrar a data/local do próximo encontro e os preparativos.
- **Participantes** — criar login para cada pessoa do clube (senha inicial,
  reset de senha, remover).
- **Atribuições** — para um encontro, definir qual miniatura cada participante
  vai pintar.

Cada participante, ao logar, só vê o próximo encontro, os preparativos e a
miniatura atribuída a ele — sem acesso às telas de admin.

## Deploy

Veja [`deploy/DEPLOY.md`](deploy/DEPLOY.md) para o passo a passo de deploy num
servidor Rocky Linux com PM2 + Nginx.

## Scripts úteis

- `npm run dev` — servidor de desenvolvimento
- `npm run build` / `npm run start` — build e start de produção
- `npm run db:migrate` — cria/atualiza as tabelas do SQLite
- `npm run db:seed-admin` — cria um usuário admin via terminal
