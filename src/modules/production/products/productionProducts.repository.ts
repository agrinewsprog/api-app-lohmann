import { RowDataPacket } from "mysql2/promise";
import { query } from "../../../db/query";

/**
 * Represents a product from the standards_products table
 */
export interface ProductRow {
  id: number;
  breed: string;
}

/**
 * Represents a standard from the standards_growth table
 */
export interface StandardGrowthRow {
  id: number;
  product_id: number;
  week: number;
  sex: "female" | "male";
  hh_pct_production: number | null;
  hd_pct_production: number | null;
  he_week: number | null;
  he_cum: number | null;
  saleable_chicks_week: number | null;
  saleable_chicks_cum: number | null;
  egg_weight_week: number | null;
  livability: number | null;
  saleable_pct_hatch: number | null;
  min_value: number | null;
  avg_value: number | null;
  max_value: number | null;
}

export class ProductionProductsRepository {
  /**
   * Fetch all products from standards_products table
   * @returns Array of products
   */
  async findAll(): Promise<ProductRow[]> {
    const sql = `
      SELECT id, breed
      FROM standards_products
      ORDER BY breed ASC
    `;
    const [rows] = await query<ProductRow[] & RowDataPacket[]>(sql, []);
    return rows;
  }

  /**
   * Fetch a product by ID
   * @param productId The product ID
   * @returns Product or null if not found
   */
  async findById(productId: number): Promise<ProductRow | null> {
    const sql = `
      SELECT id, breed
      FROM standards_products
      WHERE id = ?
    `;
    const [rows] = await query<ProductRow[] & RowDataPacket[]>(sql, [productId]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Fetch standards from standards_growth table for a given product
   * @param productId The product ID
   * @param sex The sex filter (default: 'female')
   * @returns Array of standards ordered by week ASC
   */
  async findStandardsByProductId(
    productId: number,
    sex: "female" | "male" = "female"
  ): Promise<StandardGrowthRow[]> {
    const sql = `
      SELECT
        id, product_id, week, sex,
        hh_pct_production, hd_pct_production,
        he_week, he_cum,
        saleable_chicks_week, saleable_chicks_cum,
        egg_weight_week, livability, saleable_pct_hatch,
        min_value, avg_value, max_value
      FROM standards_growth
      WHERE product_id = ? AND sex = ?
      ORDER BY week ASC
    `;
    const [rows] = await query<StandardGrowthRow[] & RowDataPacket[]>(sql, [
      productId,
      sex,
    ]);
    return rows;
  }
}
