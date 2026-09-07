const pool = require('../config/db');

// GET /products (público) — catálogo com filtros e busca
async function list(req, res, next) {
  try {
    const { gender, category_id, sort, q, available_only } = req.query;

    const conditions = [];
    const values = [];

    if (gender) {
      values.push(gender);
      conditions.push(`c.gender = $${values.length}`);
    }

    if (category_id) {
      values.push(category_id);
      conditions.push(`p.category_id = $${values.length}`);
    }

    if (available_only === 'true') {
      conditions.push(`p.status = 'available'`);
    }

    if (q) {
      values.push(`%${q}%`);
      conditions.push(`(p.name ILIKE $${values.length} OR p.code ILIKE $${values.length})`);
    }

    let orderBy = 'p.created_at DESC';
    if (sort === 'price_asc') orderBy = 'p.price ASC';
    if (sort === 'price_desc') orderBy = 'p.price DESC';
    if (sort === 'best_seller') orderBy = 'p.best_seller DESC, p.created_at DESC';

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT p.*, c.name AS category_name, c.gender AS category_gender
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       ${whereClause}
       ORDER BY ${orderBy}`,
      values
    );

    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
}

// GET /products/:code (público) — página de produto
async function getByCode(req, res, next) {
  try {
    const { code } = req.params;

    const result = await pool.query(
      `SELECT p.*, c.name AS category_name, c.gender AS category_gender
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.code = $1`,
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
}

// POST /admin/products
async function create(req, res, next) {
  try {
    const {
      code, name, category_id, olfactory_family, description,
      top_notes, heart_notes, base_notes, fixation, projection,
      size_ml, price, cost, stock_quantity, min_stock, status,
      featured, best_seller, image_url,
    } = req.body;

    if (!code || !name || !price) {
      return res.status(400).json({ error: 'Código, nome e preço são obrigatórios.' });
    }

    const result = await pool.query(
      `INSERT INTO products (
        code, name, category_id, olfactory_family, description,
        top_notes, heart_notes, base_notes, fixation, projection,
        size_ml, price, cost, stock_quantity, min_stock, status,
        featured, best_seller, image_url
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
      RETURNING *`,
      [
        code, name, category_id || null, olfactory_family, description,
        top_notes, heart_notes, base_notes, fixation, projection,
        size_ml || 50, price, cost || 0, stock_quantity || 0, min_stock || 5,
        status || 'available', featured || false, best_seller || false, image_url,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Já existe um produto com esse código.' });
    }
    return next(err);
  }
}

// PUT /admin/products/:id
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const fields = req.body;

    const allowed = [
      'code', 'name', 'category_id', 'olfactory_family', 'description',
      'top_notes', 'heart_notes', 'base_notes', 'fixation', 'projection',
      'size_ml', 'price', 'cost', 'min_stock', 'status', 'featured',
      'best_seller', 'image_url',
    ];

    const setClauses = [];
    const values = [];

    allowed.forEach((field) => {
      if (fields[field] !== undefined) {
        values.push(fields[field]);
        setClauses.push(`${field} = $${values.length}`);
      }
    });

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo válido para atualizar.' });
    }

    values.push(id);
    setClauses.push('updated_at = now()');

    const result = await pool.query(
      `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
}

// DELETE /admin/products/:id
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, getByCode, create, update, remove };
