const bcrypt = require('bcrypt');
const pool = require('../config/db');
require('dotenv').config();

async function seed() {
  const name = process.env.SEED_ADMIN_NAME || 'Administrador';
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      'Defina SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD no .env antes de rodar o seed.'
    );
    process.exit(1);
  }

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    console.log('Usuário admin já existe. Nenhuma ação necessária.');
    await pool.end();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await pool.query(
    `INSERT INTO users (name, email, password_hash, role, active)
     VALUES ($1, $2, $3, 'admin', true)`,
    [name, email, passwordHash]
  );

  console.log(`Usuário admin "${email}" criado com sucesso.`);
  await pool.end();
}

seed();
