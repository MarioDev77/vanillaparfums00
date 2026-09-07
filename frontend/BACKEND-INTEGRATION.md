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
- ⏳ Etapa 3 — Painel admin (dashboard, gestão de produtos/estoque/pedidos)
- ⏳ Etapa 4 — Módulo financeiro completo (contas a pagar/receber, relatórios, cupons, configurações)
