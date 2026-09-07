# Novas funcionalidades — Dashboard + busca/filtros

## O que tem aqui

**Backend** (precisa reimplantar no Railway):
- `orderController.js` — nova função `stats` (faturamento, pedidos por status, top 5 produtos).
- `orderRoutes.js` — nova rota `GET /api/orders/stats/summary`.

**Frontend** (precisa reimplantar na Vercel):
- `components/admin/DashboardPanel.tsx` — novo painel com os números.
- `app/admin/dashboard.tsx` — adiciona a aba "Dashboard" (agora é a aba inicial).
- `app/api/admin/stats/route.ts` — proxy novo para a rota de estatísticas.
- `app/api/admin/products/route.ts` — agora repassa filtros (busca, categoria, gênero) pro backend.
- `components/admin/ProductsPanel.tsx` — campo de busca + filtro por categoria/gênero.
- `components/admin/OrdersPanel.tsx` — campo de busca + filtro por status (filtra na hora, sem
  precisar recarregar).
- `types.ts` e demais painéis: só o tipo novo `DashboardStats` e ajustes de estilo.

## Como aplicar

1. **Backend**: copie `backend/src/controllers/orderController.js` e
   `backend/src/routes/orderRoutes.js` por cima dos seus, e faça o deploy de novo no Railway
   (ou rode `git push` se o Railway estiver conectado ao seu repositório).

2. **Frontend**: copie a pasta `frontend/` deste zip por cima da sua (mantém os arquivos que já
   existem e adiciona os novos). Não mudou nenhuma dependência, então não precisa rodar
   `pnpm install` de novo.

```bash
git add .
git commit -m "feat: dashboard com estatisticas + busca e filtros no admin"
git push
```

Se o backend e o frontend estiverem em repositórios/deploys separados, lembre de subir os dois.
