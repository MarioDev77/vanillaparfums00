const pool = require('../config/db');

// GET /admin/stock — visão geral: estoque atual, baixo, esgotado
async function overview(req, res, next) {
  try {
    const products = await pool.query(
      `SELECT id, code, name, stock_quantity, min_stock, status
       FROM products ORDER BY name ASC`
    );

    const lowStock = products.rows.filter(
      (p) => p.stock_quantity > 0 && p.stock_quantity <= p.min_stock
    );
    const soldOut = products.rows.filter((p) => p.stock_quantity <= 0);

    return res.json({
      products: products.rows,
      low_stock: lowStock,
      sold_out: soldOut,
    });
  } catch (err) {
    return next(err);
  }
}

// GET /admin/stock/movements/:productId
async function movementsByProduct(req, res, next) {
  try {
    const { productId } = req.params;
    const result = await pool.query(
      `SELECT sm.*, u.name AS created_by_name
       FROM stock_movements sm
       LEFT JOIN users u ON u.id = sm.created_by
       WHERE sm.product_id = $1
       ORDER BY sm.created_at DESC`,
      [productId]
    );
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
}

// POST /admin/stock/movements — registra movimentação e ajusta estoque em transação
async function createMovement(req, res, next) {
  const client = await pool.connect();
  try {
    const { product_id, type, quantity, reason } = req.body;

    if (!product_id || !type || !quantity) {
      return res.status(400).json({ error: 'Produto, tipo e quantidade são obrigatórios.' });
    }

    if (!['entrada', 'saida', 'ajuste'].includes(type)) {
      return res.status(400).json({ error: 'Tipo de movimentação inválido.' });
    }

    await client.query('BEGIN');

    // Trava a linha do produto para evitar condição de corrida em estoque concorrente.
    const productResult = await client.query(
      'SELECT id, stock_quantity FROM products WHERE id = $1 FOR UPDATE',
      [product_id]
    );

    if (productResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    const current = productResult.rows[0].stock_quantity;
    let delta = 0;
    if (type === 'entrada') delta = Math.abs(quantity);
    if (type === 'saida') delta = -Math.abs(quantity);
    if (type === 'ajuste') delta = quantity - current; // quantity = novo total desejado

    const newQuantity = current + delta;

    if (newQuantity < 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Estoque insuficiente para essa saída.' });
    }

    const newStatus = newQuantity <= 0 ? 'sold_out' : 'available';

    await client.query(
      `UPDATE products SET stock_quantity = $1,
       status = CASE WHEN status != 'inactive' THEN $2 ELSE status END,
       updated_at = now() WHERE id = $3`,
      [newQuantity, newStatus, product_id]
    );

    const movement = await client.query(
      `INSERT INTO stock_movements (product_id, type, quantity, reason, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [product_id, type, Math.abs(delta), reason || null, req.user?.id || null]
    );

    await client.query('COMMIT');

    return res.status(201).json({ movement: movement.rows[0], new_stock: newQuantity });
  } catch (err) {
    await client.query('ROLLBACK');
    return next(err);
  } finally {
    client.release();
  }
}

module.exports = { overview, movementsByProduct, createMovement };
