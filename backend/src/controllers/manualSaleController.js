const pool = require('../config/db');

// Colunas de data sempre formatadas como texto (YYYY-MM-DD) para evitar que o
// node-postgres devolva um objeto Date sujeito a deslocamento de fuso horário.
const SALE_COLUMNS = `
  ms.id, ms.product_id, ms.customer_name, ms.contact,
  to_char(ms.sale_date, 'YYYY-MM-DD') AS sale_date,
  to_char(ms.payment_date, 'YYYY-MM-DD') AS payment_date,
  ms.quantity, ms.unit_price, ms.unit_cost, ms.status, ms.payment_method, ms.notes,
  ms.receipt_url, ms.created_at, ms.updated_at,
  p.code AS product_code, p.name AS product_name,
  (ms.unit_price - ms.unit_cost) * ms.quantity AS profit
`;

// GET /manual-sales
async function list(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT ${SALE_COLUMNS}
       FROM manual_sales ms
       JOIN products p ON p.id = ms.product_id
       ORDER BY ms.sale_date DESC, ms.id DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
}

// POST /manual-sales
async function create(req, res, next) {
  try {
    const {
      product_id, customer_name, contact, sale_date, payment_date,
      quantity, unit_price, status, payment_method, notes, receipt_url,
    } = req.body;

    if (!product_id || !customer_name || !unit_price) {
      return res.status(400).json({ error: 'Perfume, cliente e valor de venda são obrigatórios.' });
    }

    const productResult = await pool.query('SELECT cost FROM products WHERE id = $1', [product_id]);
    if (productResult.rows.length === 0) {
      return res.status(400).json({ error: 'Perfume não encontrado.' });
    }
    const unitCost = productResult.rows[0].cost;

    const inserted = await pool.query(
      `INSERT INTO manual_sales (
        product_id, customer_name, contact, sale_date, payment_date,
        quantity, unit_price, unit_cost, status, payment_method, notes, receipt_url
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING id`,
      [
        product_id,
        customer_name,
        contact || null,
        sale_date || new Date().toISOString().slice(0, 10),
        payment_date || null,
        quantity || 1,
        unit_price,
        unitCost,
        status || 'pendente',
        payment_method || 'dinheiro',
        notes || null,
        receipt_url || null,
      ]
    );

    const result = await pool.query(
      `SELECT ${SALE_COLUMNS} FROM manual_sales ms JOIN products p ON p.id = ms.product_id WHERE ms.id = $1`,
      [inserted.rows[0].id]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23514') {
      return res.status(400).json({ error: 'Valor inválido em um dos campos (verifique quantidade e status).' });
    }
    return next(err);
  }
}

// PUT /manual-sales/:id — todos os campos são editáveis
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const fields = req.body;

    const setClauses = [];
    const values = [];

    // Se o perfume da venda foi trocado, atualiza o custo unitário
    // com o custo atual desse novo produto.
    if (fields.product_id !== undefined) {
      const productResult = await pool.query('SELECT cost FROM products WHERE id = $1', [fields.product_id]);
      if (productResult.rows.length === 0) {
        return res.status(400).json({ error: 'Perfume não encontrado.' });
      }
      values.push(fields.product_id);
      setClauses.push(`product_id = $${values.length}`);
      values.push(productResult.rows[0].cost);
      setClauses.push(`unit_cost = $${values.length}`);
    }

    const allowed = ['customer_name', 'contact', 'sale_date', 'payment_date', 'quantity', 'unit_price', 'status', 'payment_method', 'notes', 'receipt_url'];

    allowed.forEach((field) => {
      if (fields[field] !== undefined) {
        let value = fields[field];
        if (['contact', 'payment_date', 'notes', 'receipt_url'].includes(field) && value === '') {
          value = null;
        }
        values.push(value);
        setClauses.push(`${field} = $${values.length}`);
      }
    });

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo válido para atualizar.' });
    }

    values.push(id);
    setClauses.push('updated_at = now()');

    const updated = await pool.query(
      `UPDATE manual_sales SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING id`,
      values
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'Venda não encontrada.' });
    }

    const result = await pool.query(
      `SELECT ${SALE_COLUMNS} FROM manual_sales ms JOIN products p ON p.id = ms.product_id WHERE ms.id = $1`,
      [id]
    );

    return res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23514') {
      return res.status(400).json({ error: 'Valor inválido em um dos campos (verifique quantidade e status).' });
    }
    return next(err);
  }
}

// DELETE /manual-sales/:id
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM manual_sales WHERE id = $1', [id]);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

// GET /manual-sales/stats/summary — totais, lucro por perfume, série mensal (gráfico)
async function stats(req, res, next) {
  try {
    const totals = await pool.query(
      `SELECT
        COALESCE(SUM(unit_price * quantity), 0) AS total_revenue,
        COALESCE(SUM((unit_price - unit_cost) * quantity), 0) AS total_profit,
        COALESCE(SUM(unit_cost * quantity), 0) AS total_cost,
        COUNT(*) AS sales_count
       FROM manual_sales`
    );

    const byProduct = await pool.query(
      `SELECT p.id, p.code, p.name,
        SUM(ms.quantity) AS total_quantity,
        SUM(ms.unit_price * ms.quantity) AS total_revenue,
        SUM((ms.unit_price - ms.unit_cost) * ms.quantity) AS total_profit
       FROM manual_sales ms
       JOIN products p ON p.id = ms.product_id
       GROUP BY p.id, p.code, p.name
       ORDER BY total_profit DESC`
    );

    const byMonth = await pool.query(
      `SELECT
        to_char(date_trunc('month', sale_date), 'YYYY-MM') AS month,
        SUM(unit_price * quantity) AS revenue,
        SUM((unit_price - unit_cost) * quantity) AS profit
       FROM manual_sales
       GROUP BY 1
       ORDER BY 1`
    );

    return res.json({
      total_revenue: totals.rows[0].total_revenue,
      total_profit: totals.rows[0].total_profit,
      total_cost: totals.rows[0].total_cost,
      sales_count: Number(totals.rows[0].sales_count),
      by_product: byProduct.rows,
      by_month: byMonth.rows,
    });
  } catch (err) {
    return next(err);
  }
}

// GET /manual-sales/export — relatório em CSV (separador ; p/ Excel BR)
async function exportCsv(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT ms.id, p.code AS perfume_codigo, p.name AS perfume_nome, ms.customer_name AS cliente,
              ms.contact AS contato,
              to_char(ms.sale_date, 'DD/MM/YYYY') AS data_venda,
              to_char(ms.payment_date, 'DD/MM/YYYY') AS data_pagamento,
              ms.quantity AS quantidade, ms.unit_price AS valor_unitario, ms.unit_cost AS custo_unitario,
              (ms.unit_price * ms.quantity) AS receita_total,
              (ms.unit_cost * ms.quantity) AS custo_total,
              ((ms.unit_price - ms.unit_cost) * ms.quantity) AS lucro,
              ms.status, ms.payment_method AS forma_pagamento
       FROM manual_sales ms
       JOIN products p ON p.id = ms.product_id
       ORDER BY ms.sale_date DESC, ms.id DESC`
    );

    const header = [
      'ID', 'Código', 'Perfume', 'Cliente', 'Contato', 'Data da venda', 'Data de pagamento',
      'Quantidade', 'Valor unitário', 'Custo unitário', 'Receita total', 'Custo total', 'Lucro', 'Status', 'Forma de pagamento',
    ];

    const escapeCsv = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (/[",;\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
      return str;
    };

    const rows = result.rows.map((r) => [
      r.id, r.perfume_codigo, r.perfume_nome, r.cliente, r.contato || '',
      r.data_venda || '', r.data_pagamento || '',
      r.quantidade, r.valor_unitario, r.custo_unitario, r.receita_total, r.custo_total, r.lucro,
      r.status === 'pago' ? 'Pago' : 'Pendente',
      r.forma_pagamento === 'pix' ? 'Pix' : 'Dinheiro',
    ].map(escapeCsv).join(';'));

    const csv = '\uFEFF' + [header.join(';'), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio-vendas.csv"');
    return res.send(csv);
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, update, remove, stats, exportCsv };
