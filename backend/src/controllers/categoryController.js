const pool = require('../config/db');

async function list(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, slug, gender } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Nome e slug são obrigatórios.' });
    }

    const result = await pool.query(
      `INSERT INTO categories (name, slug, gender) VALUES ($1, $2, $3) RETURNING *`,
      [name, slug, gender || 'unissex']
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Já existe uma categoria com esse slug.' });
    }
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { name, slug, gender } = req.body;

    const result = await pool.query(
      `UPDATE categories SET name = COALESCE($1, name), slug = COALESCE($2, slug),
       gender = COALESCE($3, gender) WHERE id = $4 RETURNING *`,
      [name, slug, gender, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada.' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, update, remove };
