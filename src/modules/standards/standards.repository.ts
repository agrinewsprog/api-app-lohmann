import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { query, queryOne, transaction } from "../../db/query";
import {
  StandardsProduct,
  StandardsGrowth,
  CleanedCSVData,
} from "./standards.types";

export class StandardsRepository {
  async findAllProducts(): Promise<StandardsProduct[]> {
    const sql = `
      SELECT id, breed, color,image, created_at, updated_at
      FROM standards_products
      ORDER BY breed, color
    `;
    const [rows] = await query<StandardsProduct[] & RowDataPacket[]>(sql);
    return rows;
  }

  async findProductById(id: number): Promise<StandardsProduct | null> {
    const sql = `
      SELECT id, breed, color,image, created_at, updated_at
      FROM standards_products
      WHERE id = ?
    `;
    return queryOne<StandardsProduct & RowDataPacket>(sql, [id]);
  }

  async upsertProduct(breed: string, color: string): Promise<number> {
    const sql = `
      INSERT INTO standards_products (breed, color)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP, id = LAST_INSERT_ID(id)
    `;
    const [result] = await query<ResultSetHeader>(sql, [breed, color]);
    return result.insertId;
  }

  async findGrowthByProductAndWeekAndSex(
    productId: number,
    week: number,
    sex: "female" | "male",
  ): Promise<StandardsGrowth | null> {
    const sql = `
      SELECT id, product_id, week, sex, min_value, avg_value, max_value, created_at, updated_at
      FROM standards_growth
      WHERE product_id = ? AND week = ? AND sex = ?
    `;
    return queryOne<StandardsGrowth & RowDataPacket>(sql, [
      productId,
      week,
      sex,
    ]);
  }

  async findGrowthByProduct(productId: number): Promise<StandardsGrowth[]> {
    const sql = `
      SELECT id, product_id, week, sex, min_value, avg_value, max_value,
             livability, hh_pct_production, min_hd_pct_production,
             hd_pct_production, max_hd_pct_production, ehh_week,
             ehh_cum, pct_hatching_eggs, he_week, he_cum,
             total_pct_hatch, saleable_pct_hatch, saleable_chicks_week,
             saleable_chicks_cum, egg_weight_week, created_at, updated_at
      FROM standards_growth
      WHERE product_id = ?
      ORDER BY week ASC, sex ASC
    `;
    const [rows] = await query<StandardsGrowth[] & RowDataPacket[]>(sql, [
      productId,
    ]);
    return rows;
  }

  async findProductionStandardsByProduct(
    productId: number,
  ): Promise<StandardsGrowth[]> {
    const sql = `
      SELECT id, product_id, week, sex,
             livability, hh_pct_production, min_hd_pct_production,
             hd_pct_production, max_hd_pct_production, ehh_week,
             ehh_cum, pct_hatching_eggs, he_week, he_cum,
             total_pct_hatch, saleable_pct_hatch, saleable_chicks_week,
             saleable_chicks_cum, egg_weight_week, created_at, updated_at
      FROM standards_growth
      WHERE product_id = ? AND sex = 'female'
      ORDER BY week ASC
    `;
    const [rows] = await query<StandardsGrowth[] & RowDataPacket[]>(sql, [
      productId,
    ]);
    return rows;
  }

  async findGrowthByProductAndSex(
    productId: number,
    sex: "female" | "male",
  ): Promise<StandardsGrowth[]> {
    const sql = `
      SELECT id, product_id, week, sex, min_value, avg_value, max_value, created_at, updated_at
      FROM standards_growth
      WHERE product_id = ? AND sex = ?
      ORDER BY week ASC
    `;
    const [rows] = await query<StandardsGrowth[] & RowDataPacket[]>(sql, [
      productId,
      sex,
    ]);
    return rows;
  }

  async upsertGrowth(
    productId: number,
    week: number,
    sex: "female" | "male",
    minValue: number,
    avgValue: number,
    maxValue: number,
  ): Promise<void> {
    const sql = `
      INSERT INTO standards_growth (product_id, week, sex, min_value, avg_value, max_value)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        min_value = VALUES(min_value),
        avg_value = VALUES(avg_value),
        max_value = VALUES(max_value),
        updated_at = CURRENT_TIMESTAMP
    `;
    await query(sql, [productId, week, sex, minValue, avgValue, maxValue]);
  }

  async deleteAllGrowthData(): Promise<{
    productsDeleted: number;
    growthDeleted: number;
  }> {
    let growthDeleted = 0;
    let productsDeleted = 0;

    await transaction(async (conn) => {
      const [growthResult] = (await conn.execute(
        "DELETE FROM standards_growth",
      )) as [ResultSetHeader, any];
      growthDeleted = growthResult.affectedRows;

      const [productsResult] = (await conn.execute(
        "DELETE FROM standards_products",
      )) as [ResultSetHeader, any];
      productsDeleted = productsResult.affectedRows;
    });

    return { productsDeleted, growthDeleted };
  }

  async bulkImportData(
    data: CleanedCSVData[],
  ): Promise<{ productsInserted: number; growthRowsInserted: number }> {
    let productsInserted = 0;
    let growthRowsInserted = 0;

    await transaction(async (conn) => {
      const productMap = new Map<string, number>();

      for (const row of data) {
        const key = `${row.breed}|${row.color}`;

        let productId: number;

        if (productMap.has(key)) {
          productId = productMap.get(key)!;
        } else {
          const productSql = `
            INSERT INTO standards_products (breed, color)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP, id = LAST_INSERT_ID(id)
          `;
          const [productResult] = (await conn.execute(productSql, [
            row.breed,
            row.color,
          ])) as [ResultSetHeader, any];
          productId = productResult.insertId;
          productMap.set(key, productId);
          productsInserted++;
        }

        const growthSqlFemale = `
          INSERT INTO standards_growth (product_id, week, sex, min_value, avg_value, max_value)
          VALUES (?, ?, 'female', ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            min_value = VALUES(min_value),
            avg_value = VALUES(avg_value),
            max_value = VALUES(max_value),
            updated_at = CURRENT_TIMESTAMP
        `;
        await conn.execute(growthSqlFemale, [
          productId,
          row.week,
          row.minFemale,
          row.avgFemale,
          row.maxFemale,
        ]);
        growthRowsInserted++;

        const growthSqlMale = `
          INSERT INTO standards_growth (product_id, week, sex, min_value, avg_value, max_value)
          VALUES (?, ?, 'male', ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            min_value = VALUES(min_value),
            avg_value = VALUES(avg_value),
            max_value = VALUES(max_value),
            updated_at = CURRENT_TIMESTAMP
        `;
        await conn.execute(growthSqlMale, [
          productId,
          row.week,
          row.minMale,
          row.avgMale,
          row.maxMale,
        ]);
        growthRowsInserted++;
      }
    });

    return { productsInserted, growthRowsInserted };
  }
}
