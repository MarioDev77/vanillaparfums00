# Vanilla Parfums — Sistema completo

Projeto do zero: e-commerce de contratipos de perfumes de luxo.

## Pastas
- `vanilla-parfums-backend/` — API Node/Express + PostgreSQL (migrations, auth JWT, catálogo, estoque, pedidos)
- `vanilla-parfums-frontend/` — Next.js (catálogo, produto, carrinho, checkout)

## Ordem de setup

1. **Backend**
   ```bash
   cd vanilla-parfums-backend
   npm install
   cp .env.example .env   # preencher DATABASE_URL, JWT_SECRET, SEED_ADMIN_*
   npm run migrate
   npm run seed
   npm run seed:catalog   # popula os 36 perfumes reais do catálogo (linha Masculino)
   npm run dev
   ```

2. **Frontend**
   ```bash
   cd vanilla-parfums-frontend
   npm install
   cp .env.local.example .env.local   # apontar NEXT_PUBLIC_API_URL para o backend
   npm run dev
   ```

## Deploy
- Backend → Railway (provisionar PostgreSQL, setar variáveis de ambiente, rodar `npm run migrate` e `npm run seed` uma vez)
- Frontend → Vercel (setar `NEXT_PUBLIC_API_URL` com a URL pública do backend no Railway)

## Status do projeto
- ✅ Etapa 1 — Backend base (banco, auth, catálogo, estoque)
- ✅ Etapa 2 — Frontend cliente (catálogo, produto, carrinho, checkout) + endpoint de pedidos
- ✅ Etapa 3 — Painel admin (login com JWT, produtos, categorias, estoque e pedidos — tudo conectado ao backend Express real via `/app/api/admin/*`)
- ⏳ Etapa 4 — Módulo financeiro completo (contas a pagar/receber, relatórios, cupons, configurações)

## Painel administrativo (`/admin`)

O painel antigo (que usava better-auth + uma tabela `products` separada no Neon) foi removido.
Agora `/admin` autentica direto contra `POST /api/auth/login` do backend Express e usa as rotas
reais de `productController.js`, `categoryController.js`, `stockController.js` e `orderController.js`.

- O JWT retornado pelo backend fica num cookie `httpOnly` (`admin_token`), nunca exposto ao JS do navegador.
- As rotas em `frontend/app/api/admin/*` funcionam como um proxy: recebem a chamada do painel,
  anexam `Authorization: Bearer <token>` e repassam para o backend Express (`NEXT_PUBLIC_API_URL`).
- Login: use o usuário criado por `npm run seed` no backend (variáveis `SEED_ADMIN_*` do `.env`).
- Upload de imagem de produto continua opcional via Vercel Blob (`/api/admin/upload`); também dá
  para colar a URL da imagem direto no campo do formulário.
