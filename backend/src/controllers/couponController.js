const pool = require('../config/db');

// GET /api/coupons — lista todos os cupons (admin)
async function list(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
}

// POST /api/coupons — cria um novo cupom (admin)
async function create(req, res, next) {
  try {
    const { code, discount_type, discount_value, valid_from, valid_until, max_uses, active } = req.body;

    if (!code || !discount_type || discount_value === undefined || discount_value === null) {
      return res.status(400).json({ error: 'Código, tipo e valor do desconto são obrigatórios.' });
    }

    if (!['percentage', 'fixed'].includes(discount_type)) {
      return res.status(400).json({ error: 'Tipo de desconto inválido.' });
    }

    const result = await pool.query(
      `INSERT INTO coupons (code, discount_type, discount_value, valid_from, valid_until, max_uses, active)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, true)) RETURNING *`,
      [code.trim().toUpperCase(), discount_type, discount_value, valid_from || null, valid_until || null, max_uses || null, active]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Já existe um cupom com esse código.' });
    }
    return next(err);
  }
}

// PUT /api/coupons/:id — atualiza um cupom (admin)
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { code, discount_type, discount_value, valid_from, valid_until, max_uses, active } = req.body;

    if (discount_type && !['percentage', 'fixed'].includes(discount_type)) {
      return res.status(400).json({ error: 'Tipo de desconto inválido.' });
    }

    const result = await pool.query(
      `UPDATE coupons SET
         code = COALESCE($1, code),
         discount_type = COALESCE($2, discount_type),
         discount_value = COALESCE($3, discount_value),
         valid_from = $4,
         valid_until = $5,
         max_uses = $6,
         active = COALESCE($7, active)
       WHERE id = $8 RETURNING *`,
      [
        code ? code.trim().toUpperCase() : null,
        discount_type || null,
        discount_value ?? null,
        valid_from ?? null,
        valid_until ?? null,
        max_uses ?? null,
        active,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cupom não encontrado.' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Já existe um cupom com esse código.' });
    }
    return next(err);
  }
}

// DELETE /api/coupons/:id — remove um cupom (admin)
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM coupons WHERE id = $1', [id]);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

// GET /api/coupons/validate/:code — valida um cupom pelo código (uso público, no checkout via WhatsApp/loja)
async function validate(req, res, next) {
  try {
    const { code } = req.params;
    const result = await pool.query(
      `SELECT * FROM coupons WHERE code = $1 AND active = true
         AND (valid_from IS NULL OR valid_from <= now())
         AND (valid_until IS NULL OR valid_until >= now())
         AND (max_uses IS NULL OR used_count < max_uses)`,
      [code.trim().toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cupom inválido, expirado ou esgotado.' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, update, remove, validate };
