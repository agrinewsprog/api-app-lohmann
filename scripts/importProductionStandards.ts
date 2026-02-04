/**
 * Import Production Standards from CSV
 *
 * This script reads /standards-2.csv and performs UPSERT operations
 * to the standards_growth table by (product_id, week, sex).
 *
 * Usage: npx ts-node scripts/importProductionStandards.ts
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import mysql from 'mysql2/promise';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Create pool with environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lohmann_app',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10
});

// CSV Column headers (as they appear in the file)
interface CSVRow {
  Breed: string;
  Color: string;
  'Age in \nWeeks': string;
  Livability: string;
  'HH % Production': string;
  'Min HD % Production': string;
  'HD % Production': string;
  'Max HD % Production': string;
  'EHH week\n': string;
  'EHH cum': string;
  '% Hatching Eggs': string;
  'HE week': string;
  'HE cum': string;
  'total % Hatch': string;
  'saleable % Hatch': string;
  'Saleable Chicks week': string;
  'Saleable Chicks Cum': string;
  'Egg weight week': string;
}

interface ProductionStandard {
  productId: number;
  week: number;
  sex: 'female';
  livability: number | null;
  hhPctProduction: number | null;
  minHdPctProduction: number | null;
  hdPctProduction: number | null;
  maxHdPctProduction: number | null;
  ehhWeek: number | null;
  ehhCum: number | null;
  pctHatchingEggs: number | null;
  heWeek: number | null;
  heCum: number | null;
  totalPctHatch: number | null;
  saleablePctHatch: number | null;
  saleableChicksWeek: number | null;
  saleableChicksCum: number | null;
  eggWeightWeek: number | null;
}

interface ImportStats {
  totalRows: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}

/**
 * Parse a European-formatted number (comma as decimal separator)
 * Strips % sign if present
 * Returns null for empty values
 */
function parseNumber(value: string | undefined): number | null {
  if (!value || value.trim() === '') {
    return null;
  }

  // Remove % sign if present and trim
  let cleaned = value.trim().replace(/%$/, '').trim();

  // Replace comma with dot for decimal
  cleaned = cleaned.replace(',', '.');

  const num = parseFloat(cleaned);

  if (isNaN(num) || !isFinite(num)) {
    return null;
  }

  return num;
}

/**
 * Parse week number
 */
function parseWeek(value: string | undefined): number | null {
  if (!value || value.trim() === '') {
    return null;
  }

  const num = parseInt(value.trim(), 10);

  if (isNaN(num) || !isFinite(num) || num < 0) {
    return null;
  }

  return num;
}

/**
 * Get product_id from standards_products table by breed and color
 */
async function getProductId(breed: string, color: string): Promise<number | null> {
  const sql = `
    SELECT id FROM standards_products
    WHERE breed = ? AND color = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute<RowDataPacket[]>(sql, [breed, color]);

  if (rows.length > 0) {
    return rows[0].id;
  }

  return null;
}

/**
 * Create product if it doesn't exist
 */
async function upsertProduct(breed: string, color: string): Promise<number> {
  const sql = `
    INSERT INTO standards_products (breed, color)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP, id = LAST_INSERT_ID(id)
  `;

  const [result] = await pool.execute<ResultSetHeader>(sql, [breed, color]);
  return result.insertId;
}

/**
 * UPSERT a production standard row
 */
async function upsertProductionStandard(data: ProductionStandard): Promise<'inserted' | 'updated'> {
  // Check if record exists
  const checkSql = `
    SELECT id FROM standards_growth
    WHERE product_id = ? AND week = ? AND sex = ?
  `;

  const [existing] = await pool.execute<RowDataPacket[]>(checkSql, [
    data.productId,
    data.week,
    data.sex
  ]);

  const isUpdate = existing.length > 0;

  const sql = `
    INSERT INTO standards_growth (
      product_id, week, sex,
      min_value, avg_value, max_value,
      livability, hh_pct_production, min_hd_pct_production,
      hd_pct_production, max_hd_pct_production, ehh_week,
      ehh_cum, pct_hatching_eggs, he_week, he_cum,
      total_pct_hatch, saleable_pct_hatch, saleable_chicks_week,
      saleable_chicks_cum, egg_weight_week
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      livability = VALUES(livability),
      hh_pct_production = VALUES(hh_pct_production),
      min_hd_pct_production = VALUES(min_hd_pct_production),
      hd_pct_production = VALUES(hd_pct_production),
      max_hd_pct_production = VALUES(max_hd_pct_production),
      ehh_week = VALUES(ehh_week),
      ehh_cum = VALUES(ehh_cum),
      pct_hatching_eggs = VALUES(pct_hatching_eggs),
      he_week = VALUES(he_week),
      he_cum = VALUES(he_cum),
      total_pct_hatch = VALUES(total_pct_hatch),
      saleable_pct_hatch = VALUES(saleable_pct_hatch),
      saleable_chicks_week = VALUES(saleable_chicks_week),
      saleable_chicks_cum = VALUES(saleable_chicks_cum),
      egg_weight_week = VALUES(egg_weight_week),
      updated_at = CURRENT_TIMESTAMP
  `;

  // Note: min_value, avg_value, max_value are kept as 0 for production standards
  // since they're used for body weight data
  await pool.execute(sql, [
    data.productId,
    data.week,
    data.sex,
    0, // min_value (body weight, not used for production)
    0, // avg_value (body weight, not used for production)
    0, // max_value (body weight, not used for production)
    data.livability,
    data.hhPctProduction,
    data.minHdPctProduction,
    data.hdPctProduction,
    data.maxHdPctProduction,
    data.ehhWeek,
    data.ehhCum,
    data.pctHatchingEggs,
    data.heWeek,
    data.heCum,
    data.totalPctHatch,
    data.saleablePctHatch,
    data.saleableChicksWeek,
    data.saleableChicksCum,
    data.eggWeightWeek
  ]);

  return isUpdate ? 'updated' : 'inserted';
}

/**
 * Main import function
 */
async function importProductionStandards(csvPath: string): Promise<ImportStats> {
  const stats: ImportStats = {
    totalRows: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: []
  };

  // Cache for product lookups
  const productCache = new Map<string, number>();

  return new Promise((resolve, reject) => {
    const parser = parse({
      delimiter: ';',
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      bom: true
    });

    const rows: CSVRow[] = [];

    fs.createReadStream(csvPath, { encoding: 'utf-8' })
      .pipe(parser)
      .on('data', (row: CSVRow) => {
        rows.push(row);
      })
      .on('end', async () => {
        console.log(`[INFO] Parsed ${rows.length} rows from CSV`);

        for (const row of rows) {
          stats.totalRows++;

          try {
            // Get breed and color
            const breed = row.Breed?.trim();
            const color = row.Color?.trim();

            if (!breed || !color) {
              stats.skipped++;
              stats.errors.push(`Row ${stats.totalRows}: Missing breed or color`);
              continue;
            }

            // Get week
            const weekKey = Object.keys(row).find(k => k.includes('Weeks'));
            const weekValue = weekKey ? (row as any)[weekKey] : undefined;
            const week = parseWeek(weekValue);

            if (week === null) {
              stats.skipped++;
              stats.errors.push(`Row ${stats.totalRows}: Invalid week value`);
              continue;
            }

            // Get or create product_id
            const cacheKey = `${breed}|${color}`;
            let productId: number;

            if (productCache.has(cacheKey)) {
              productId = productCache.get(cacheKey)!;
            } else {
              // Try to find existing product
              const existingId = await getProductId(breed, color);

              if (existingId) {
                productId = existingId;
              } else {
                // Create new product
                productId = await upsertProduct(breed, color);
                console.log(`[INFO] Created new product: ${breed} - ${color} (ID: ${productId})`);
              }

              productCache.set(cacheKey, productId);
            }

            // Parse all numeric fields
            const ehhWeekKey = Object.keys(row).find(k => k.includes('EHH') && k.includes('week'));

            const data: ProductionStandard = {
              productId,
              week,
              sex: 'female', // Production standards are typically for females
              livability: parseNumber(row.Livability),
              hhPctProduction: parseNumber(row['HH % Production']),
              minHdPctProduction: parseNumber(row['Min HD % Production']),
              hdPctProduction: parseNumber(row['HD % Production']),
              maxHdPctProduction: parseNumber(row['Max HD % Production']),
              ehhWeek: parseNumber(ehhWeekKey ? (row as any)[ehhWeekKey] : undefined),
              ehhCum: parseNumber(row['EHH cum']),
              pctHatchingEggs: parseNumber(row['% Hatching Eggs']),
              heWeek: parseNumber(row['HE week']),
              heCum: parseNumber(row['HE cum']),
              totalPctHatch: parseNumber(row['total % Hatch']),
              saleablePctHatch: parseNumber(row['saleable % Hatch']),
              saleableChicksWeek: parseNumber(row['Saleable Chicks week']),
              saleableChicksCum: parseNumber(row['Saleable Chicks Cum']),
              eggWeightWeek: parseNumber(row['Egg weight week'])
            };

            // UPSERT the record
            const result = await upsertProductionStandard(data);

            if (result === 'inserted') {
              stats.inserted++;
            } else {
              stats.updated++;
            }

          } catch (error) {
            stats.skipped++;
            const message = error instanceof Error ? error.message : String(error);
            stats.errors.push(`Row ${stats.totalRows}: ${message}`);
          }
        }

        resolve(stats);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * Main entry point
 */
async function main() {
  console.log('========================================');
  console.log('Production Standards Import');
  console.log('========================================');
  console.log('');

  const csvPath = process.argv[2] || '/Users/alexdesign/Desktop/lohmann-app/api/standards-2.csv';

  console.log(`[INFO] CSV Path: ${csvPath}`);
  console.log('');

  // Check if file exists
  if (!fs.existsSync(csvPath)) {
    console.error(`[ERROR] CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  try {
    const stats = await importProductionStandards(csvPath);

    console.log('');
    console.log('========================================');
    console.log('Import Summary');
    console.log('========================================');
    console.log(`Total rows processed: ${stats.totalRows}`);
    console.log(`Rows inserted:        ${stats.inserted}`);
    console.log(`Rows updated:         ${stats.updated}`);
    console.log(`Rows skipped:         ${stats.skipped}`);
    console.log('');

    if (stats.errors.length > 0) {
      console.log('Errors (first 10):');
      stats.errors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
      if (stats.errors.length > 10) {
        console.log(`  ... and ${stats.errors.length - 10} more errors`);
      }
    }

    console.log('');
    console.log('[SUCCESS] Import completed');

  } catch (error) {
    console.error('[ERROR] Import failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
