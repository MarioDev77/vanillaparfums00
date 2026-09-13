const PDFDocument = require('pdfkit');
const pool = require('../config/db');

// Lê e valida ?from=YYYY-MM-DD&to=YYYY-MM-DD da querystring.
// Retorna null para o lado que não foi informado (sem filtro naquela ponta).
function parsePeriod(req) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const from = dateRegex.test(req.query.from || '') ? req.query.from : null;
  const to = dateRegex.test(req.query.to || '') ? req.query.to : null;
  return { from, to };
}

function formatMoneyBr(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDateBr(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

// Totais unificados (vendas manuais + pedidos da loja, exceto cancelados) no período dado.
async function getSummaryData(from, to) {
  const manual = await pool.query(
    `SELECT
      COALESCE(SUM(unit_price * quantity), 0) AS revenue,
      COALESCE(SUM(unit_cost * quantity), 0) AS cost,
      COUNT(*) AS count
     FROM manual_sales
     WHERE ($1::date IS NULL OR sale_date >= $1)
       AND ($2::date IS NULL OR sale_date <= $2)`,
    [from, to]
  );

  const orders = await pool.query(
    `SELECT
      COALESCE(SUM(o.total), 0) AS revenue,
      COALESCE(SUM(costs.cost), 0) AS cost,
      COUNT(*) AS count
     FROM orders o
     LEFT JOIN (
       SELECT order_id, SUM(unit_cost * quantity) AS cost
       FROM order_items GROUP BY order_id
     ) costs ON costs.order_id = o.id
     WHERE o.status != 'cancelado'
       AND ($1::date IS NULL OR o.created_at::date >= $1)
       AND ($2::date IS NULL OR o.created_at::date <= $2)`,
    [from, to]
  );

  const receivablesManual = await pool.query(
    `SELECT COALESCE(SUM(unit_price * quantity), 0) AS total, COUNT(*) AS count
     FROM manual_sales WHERE status = 'pendente'`
  );
  const receivablesOrders = await pool.query(
    `SELECT COALESCE(SUM(total), 0) AS total, COUNT(*) AS count
     FROM orders WHERE status = 'aguardando_pagamento'`
  );

  const m = manual.rows[0];
  const o = orders.rows[0];
  const revenue = Number(m.revenue) + Number(o.revenue);
  const cost = Number(m.cost) + Number(o.cost);

  return {
    total_revenue: revenue,
    total_cost: cost,
    total_profit: revenue - cost,
    sales_count: Number(m.count) + Number(o.count),
    manual: { revenue: Number(m.revenue), cost: Number(m.cost), count: Number(m.count) },
    orders: { revenue: Number(o.revenue), cost: Number(o.cost), count: Number(o.count) },
    receivables_total: Number(receivablesManual.rows[0].total) + Number(receivablesOrders.rows[0].total),
    receivables_count: Number(receivablesManual.rows[0].count) + Number(receivablesOrders.rows[0].count),
  };
}

// Série mensal unificada (para o gráfico de evolução) no período dado.
async function getMonthlyData(from, to) {
  const manual = await pool.query(
    `SELECT
      to_char(date_trunc('month', sale_date), 'YYYY-MM') AS month,
      SUM(unit_price * quantity) AS revenue,
      SUM((unit_price - unit_cost) * quantity) AS profit
     FROM manual_sales
     WHERE ($1::date IS NULL OR sale_date >= $1)
       AND ($2::date IS NULL OR sale_date <= $2)
     GROUP BY 1`,
    [from, to]
  );

  const orders = await pool.query(
    `SELECT
      to_char(date_trunc('month', o.created_at), 'YYYY-MM') AS month,
      SUM(o.total) AS revenue,
      SUM(o.total - COALESCE(costs.cost, 0)) AS profit
     FROM orders o
     LEFT JOIN (
       SELECT order_id, SUM(unit_cost * quantity) AS cost
       FROM order_items GROUP BY order_id
     ) costs ON costs.order_id = o.id
     WHERE o.status != 'cancelado'
       AND ($1::date IS NULL OR o.created_at::date >= $1)
       AND ($2::date IS NULL OR o.created_at::date <= $2)
     GROUP BY 1`,
    [from, to]
  );

  const byMonth = new Map();
  for (const row of [...manual.rows, ...orders.rows]) {
    const current = byMonth.get(row.month) || { revenue: 0, profit: 0 };
    current.revenue += Number(row.revenue);
    current.profit += Number(row.profit);
    byMonth.set(row.month, current);
  }

  return Array.from(byMonth.entries())
    .map(([month, v]) => ({ month, revenue: v.revenue, profit: v.profit }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// Lista unificada do que ainda está pendente de recebimento (posição atual, sem filtro de período).
async function getReceivablesData() {
  const manual = await pool.query(
    `SELECT ms.id, ms.customer_name AS customer, ms.contact,
            p.name AS description, to_char(ms.sale_date, 'YYYY-MM-DD') AS date,
            (ms.unit_price * ms.quantity) AS amount
     FROM manual_sales ms
     JOIN products p ON p.id = ms.product_id
     WHERE ms.status = 'pendente'`
  );

  const orders = await pool.query(
    `SELECT o.id, COALESCE(c.name, 'Cliente não identificado') AS customer, c.phone AS contact,
            o.order_number AS description, to_char(o.created_at, 'YYYY-MM-DD') AS date,
            o.total AS amount
     FROM orders o
     LEFT JOIN customers c ON c.id = o.customer_id
     WHERE o.status = 'aguardando_pagamento'`
  );

  const items = [
    ...manual.rows.map((r) => ({ ...r, source: 'manual', amount: Number(r.amount) })),
    ...orders.rows.map((r) => ({ ...r, source: 'pedido', amount: Number(r.amount) })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const total = items.reduce((sum, i) => sum + i.amount, 0);

  return { items, total, count: items.length };
}

// GET /finance/summary?from=&to=
async function summary(req, res, next) {
  try {
    const { from, to } = parsePeriod(req);
    return res.json(await getSummaryData(from, to));
  } catch (err) {
    return next(err);
  }
}

// GET /finance/monthly?from=&to=
async function monthly(req, res, next) {
  try {
    const { from, to } = parsePeriod(req);
    return res.json(await getMonthlyData(from, to));
  } catch (err) {
    return next(err);
  }
}

// GET /finance/receivables
async function receivables(req, res, next) {
  try {
    return res.json(await getReceivablesData());
  } catch (err) {
    return next(err);
  }
}

const MONTH_LABELS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
function monthLabel(month) {
  const [year, m] = month.split('-');
  return `${MONTH_LABELS[Number(m) - 1]}/${year}`;
}

// GET /finance/export/pdf?from=&to= — relatório financeiro completo em PDF
async function exportPdf(req, res, next) {
  try {
    const { from, to } = parsePeriod(req);
    const [sum, months, rec] = await Promise.all([
      getSummaryData(from, to),
      getMonthlyData(from, to),
      getReceivablesData(),
    ]);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio-financeiro.pdf"');

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    doc.pipe(res);

    doc.fontSize(18).text('Vanilla Parfums — Relatório financeiro', { align: 'left' });
    const periodLabel = from || to
      ? `Período: ${from ? formatDateBr(from) : 'início'} até ${to ? formatDateBr(to) : 'hoje'}`
      : 'Período: todo o histórico';
    doc.fontSize(10).fillColor('#666').text(periodLabel);
    doc.fillColor('#000').moveDown(1);

    doc.fontSize(13).text('Resumo');
    doc.moveDown(0.3);
    doc.fontSize(10);
    const summaryLines = [
      ['Faturamento total', formatMoneyBr(sum.total_revenue)],
      ['  vendas manuais', formatMoneyBr(sum.manual.revenue)],
      ['  pedidos da loja', formatMoneyBr(sum.orders.revenue)],
      ['Custo total', formatMoneyBr(sum.total_cost)],
      ['Lucro total', formatMoneyBr(sum.total_profit)],
      ['Total de vendas', String(sum.sales_count)],
      ['A receber (posição atual)', `${formatMoneyBr(sum.receivables_total)} em ${sum.receivables_count} venda(s)`],
    ];
    summaryLines.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`);
    });
    doc.moveDown(1);

    doc.fontSize(13).text('Evolução mensal');
    doc.moveDown(0.3);
    if (months.length === 0) {
      doc.fontSize(10).text('Nenhuma venda no período.');
    } else {
      doc.fontSize(9);
      const colX = { month: 40, revenue: 160, profit: 300 };
      const headerY = doc.y;
      doc.text('Mês', colX.month, headerY);
      doc.text('Receita', colX.revenue, headerY);
      doc.text('Lucro', colX.profit, headerY);
      doc.moveDown(0.5);
      months.forEach((row) => {
        const y = doc.y;
        doc.text(monthLabel(row.month), colX.month, y);
        doc.text(formatMoneyBr(row.revenue), colX.revenue, y);
        doc.text(formatMoneyBr(row.profit), colX.profit, y);
        doc.moveDown(0.3);
      });
    }
    doc.moveDown(1);

    doc.fontSize(13).text('Recebíveis pendentes');
    doc.moveDown(0.3);
    if (rec.items.length === 0) {
      doc.fontSize(10).text('Nenhum valor pendente no momento.');
    } else {
      doc.fontSize(9);
      const colX = { date: 40, source: 100, customer: 160, desc: 320, amount: 460 };
      const headerY = doc.y;
      doc.text('Data', colX.date, headerY);
      doc.text('Origem', colX.source, headerY);
      doc.text('Cliente', colX.customer, headerY);
      doc.text('Referência', colX.desc, headerY);
      doc.text('Valor', colX.amount, headerY);
      doc.moveDown(0.5);
      rec.items.forEach((item) => {
        if (doc.y > 760) doc.addPage();
        const y = doc.y;
        doc.text(formatDateBr(item.date), colX.date, y);
        doc.text(item.source === 'pedido' ? 'Pedido' : 'Manual', colX.source, y);
        doc.text(item.customer, colX.customer, y, { width: 150 });
        doc.text(item.description || '', colX.desc, y, { width: 130 });
        doc.text(formatMoneyBr(item.amount), colX.amount, y);
        doc.moveDown(0.3);
      });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Total pendente: ${formatMoneyBr(rec.total)}`, { align: 'right' });
    }

    doc.end();
  } catch (err) {
    return next(err);
  }
}

module.exports = { summary, monthly, receivables, exportPdf };
