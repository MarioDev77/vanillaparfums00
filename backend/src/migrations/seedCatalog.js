const pool = require('../config/db');
require('dotenv').config();

// Catálogo oficial da Vanilla Parfums (linha masculina, códigos M01–M36).
// Preço e estoque abaixo são valores padrão de partida — ajuste no painel admin.
const DEFAULT_PRICE = 69.9;
const DEFAULT_STOCK = 20;
const DEFAULT_SIZE_ML = 50;

const PRODUCTS = [
  { code: 'M01', name: 'Bleu de Chanel' },
  { code: 'M02', name: 'Dolce & Gabbana' },
  { code: 'M03', name: '212 Men NYC' },
  { code: 'M04', name: '212 VIP Men' },
  { code: 'M05', name: 'Polo Blue' },
  { code: 'M06', name: '212 VIP Black' },
  { code: 'M07', name: 'CK One' },
  { code: 'M08', name: '212 Sexy Men' },
  { code: 'M09', name: 'One Million' },
  { code: 'M10', name: 'Invictus' },
  { code: 'M11', name: 'Azzaro Wanted' },
  { code: 'M12', name: 'Versace Eros' },
  { code: 'M13', name: 'Jean Paul Gaultier' },
  { code: 'M14', name: 'Good Girl' },
  { code: 'M15', name: 'Scandal' },
  { code: 'M16', name: "Terre d'Hermès" },
  { code: 'M17', name: 'Armani Code' },
  { code: 'M18', name: 'Allure Sport' },
  { code: 'M19', name: 'Invictus Perfect Intense' },
  { code: 'M20', name: 'Invictus Aqua' },
  { code: 'M21', name: 'Stronger With You' },
  { code: 'M22', name: 'Acqua di Giò' },
  { code: 'M23', name: 'Sí' },
  { code: 'M24', name: "L'Interdit" },
  { code: 'M25', name: "L'Eau d'Issey" },
  { code: 'M26', name: 'YSL Y' },
  { code: 'M27', name: 'Sauvage' },
  { code: 'M28', name: 'Bleu de Chanel' },
  { code: 'M29', name: 'Hugo Boss' },
  { code: 'M30', name: 'Prada Black' },
  { code: 'M31', name: 'Ultra Male' },
  { code: 'M32', name: 'Le Male' },
  { code: 'M33', name: "L'Obsession" },
  { code: 'M34', name: 'Versace Pour Homme' },
  { code: 'M35', name: 'Aqva' },
  { code: 'M36', name: 'Fahrenheit' },
];

async function seedCatalog() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const categoryResult = await client.query(
      `INSERT INTO categories (name, slug, gender)
       VALUES ('Masculino', 'masculino', 'masculino')
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`
    );
    const categoryId = categoryResult.rows[0].id;

    for (const product of PRODUCTS) {
      await client.query(
        `INSERT INTO products (code, name, category_id, description, size_ml, price, stock_quantity, min_stock, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 5, 'available')
         ON CONFLICT (code) DO UPDATE SET
           name = EXCLUDED.name,
           category_id = EXCLUDED.category_id
         `,
        [
          product.code,
          product.name,
          categoryId,
          `Fragrância Vanilla Parfums inspirada em referências da perfumaria internacional (${product.name}).`,
          DEFAULT_SIZE_ML,
          DEFAULT_PRICE,
          DEFAULT_STOCK,
        ]
      );
    }

    await client.query('COMMIT');
    console.log(`Catálogo populado: ${PRODUCTS.length} produtos na categoria Masculino.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao popular o catálogo:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedCatalog();
