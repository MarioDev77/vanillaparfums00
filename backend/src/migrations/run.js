const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function runMigrations() {
  const dir = __dirname;
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`Encontradas ${files.length} migrations.`);

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    console.log(`Aplicando ${file}...`);
    try {
      await pool.query(sql);
      console.log(`✔ ${file} aplicada com sucesso.`);
    } catch (err) {
      console.error(`✘ Erro ao aplicar ${file}:`, err.message);
      process.exit(1);
    }
  }

  console.log('Todas as migrations foram aplicadas.');
  await pool.end();
}

runMigrations();
