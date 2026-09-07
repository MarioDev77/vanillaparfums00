const pool = require('../config/db');

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `VP-${ts}-${rand}`;
}

// POST /api/orders — checkout público
async function create(req, res, next) {
  const client = await pool.connect();
  try {
    const {
      customer,
      items,
      payment_method,
      coupon_code,
      shipping,
    } = req.body;

    if (!customer?.name || !items?.length || !payment_method) {
      return res.status(400).json({ error: 'Dados incompletos para o pedido.' });
    }

    if (!['pix', 'cartao', 'outro'].includes(payment_method)) {
      return res.status(400).json({ error: 'Forma de pagamento inválida.' });
    }

    await client.query('BEGIN');

    const customerResult = await client.query(
      `INSERT INTO customers (name, email, phone, cep, state, city, address, number, complement)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [
        customer.name, customer.email || null, customer.phone || null,
        customer.cep || null, customer.state || null, customer.city || null,
        customer.address || null, customer.number || null, customer.complement || null,
      ]
    );
    const customerId = customerResult.rows[0].id;

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const productResult = await client.query(
        'SELECT id, price, stock_quantity, status FROM products WHERE id = $1 FOR UPDATE',
        [item.product_id]
      );
      const product = productResult.rows[0];

      if (!product) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Produto ${item.product_id} não encontrado.` });
      }
      if (product.status !== 'available' || product.stock_quantity < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: `Estoque insuficiente para o produto ${item.product_id}.` });
      }

      const unitPrice = parseFloat(product.price);
      const lineSubtotal = unitPrice * item.quantity;
      subtotal += lineSubtotal;

      validatedItems.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price: unitPrice,
        subtotal: lineSubtotal,
      });
    }

    let discount = 0;
    let couponId = null;

    if (coupon_code) {
      const couponResult = await client.query(
        `SELECT * FROM coupons WHERE code = $1 AND active = true
         AND (valid_until IS NULL OR valid_until > now())
         AND (max_uses IS NULL OR used_count < max_uses)`,
        [coupon_code]
      );
      const couponRow = couponResult.rows[0];

      if (couponRow) {
        couponId = couponRow.id;
        discount =
          couponRow.discount_type === 'percentage'
            ? (subtotal * parseFloat(couponRow.discount_value)) / 100
            : parseFloat(couponRow.discount_value);

        await client.query('UPDATE coupons SET used_count = used_count + 1 WHERE id = $1', [
          couponId,
        ]);
      }
    }

    const shippingValue = shipping ? parseFloat(shipping) : 0;
    const total = Math.max(subtotal - discount, 0) + shippingValue;
    const orderNumber = generateOrderNumber();

    const orderResult = await client.query(
      `INSERT INTO orders (order_number, customer_id, coupon_id, subtotal, discount, shipping, total, payment_method, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'aguardando_pagamento') RETURNING *`,
      [orderNumber, customerId, couponId, subtotal, discount, shippingValue, total, payment_method]
    );
    const order = orderResult.rows[0];

    for (const item of validatedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
         VALUES ($1,$2,$3,$4,$5)`,
        [order.id, item.product_id, item.quantity, item.unit_price, item.subtotal]
      );

      const newQuantityResult = await client.query(
        `UPDATE products SET stock_quantity = stock_quantity - $1, updated_at = now()
         WHERE id = $2 RETURNING stock_quantity`,
        [item.quantity, item.product_id]
      );

      const newQuantity = newQuantityResult.rows[0].stock_quantity;
      if (newQuantity <= 0) {
        await client.query(`UPDATE products SET status = 'sold_out' WHERE id = $1`, [
          item.product_id,
        ]);
      }

      await client.query(
        `INSERT INTO stock_movements (product_id, type, quantity, reason)
         VALUES ($1, 'saida', $2, $3)`,
        [item.product_id, item.quantity, `Venda — pedido ${orderNumber}`]
      );
    }

    await client.query('COMMIT');

    return res.status(201).json({ order_number: order.order_number, total: order.total });
  } catch (err) {
    await client.query('ROLLBACK');
    return next(err);
  } finally {
    client.release();
  }
}

// GET /admin/orders
async function list(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT o.*, c.name AS customer_name
       FROM orders o LEFT JOIN customers c ON c.id = o.customer_id
       ORDER BY o.created_at DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
}

// GET /admin/orders/:id
async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const order = await pool.query(
      `SELECT o.*, c.name AS customer_name, c.email, c.phone, c.address, c.number,
              c.complement, c.city, c.state, c.cep
       FROM orders o LEFT JOIN customers c ON c.id = o.customer_id
       WHERE o.id = $1`,
      [id]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    const items = await pool.query(
      `SELECT oi.*, p.name AS product_name, p.code AS product_code
       FROM order_items oi JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1`,
      [id]
    );

    return res.json({ ...order.rows[0], items: items.rows });
  } catch (err) {
    return next(err);
  }
}

// PATCH /admin/orders/:id/status
async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'aguardando_pagamento', 'pagamento_aprovado', 'em_preparacao',
      'enviado', 'entregue', 'cancelado',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido.' });
    }

    const result = await pool.query(
      `UPDATE orders SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
}

module.exports = { create, list, getById, updateStatus };
