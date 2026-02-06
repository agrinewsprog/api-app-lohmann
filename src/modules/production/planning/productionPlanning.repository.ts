import { RowDataPacket } from "mysql2/promise";
import { query } from "../../../db/query";

/**
 * Represents a row from the standars_growth table
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
}

/**
 * Represents a product from the products table
 */
export interface ProductRow {
  id: number;
  breed: string;
}

export class ProductionPlanningRepository {
  /**
   * Fetch standards from standars_growth table for a given product
   * @param productId The product ID
   * @param sex The sex filter (default: 'female')
   * @returns Array of standards ordered by week ASC
   */
  async findStandardsByProductId(
    productId: number,
    sex: "female" | "male" = "female",
  ): Promise<StandardGrowthRow[]> {
    const sql = `
      SELECT
        id, product_id, week, sex,
        hh_pct_production, hd_pct_production,
        he_week, he_cum,
        saleable_chicks_week, saleable_chicks_cum,
        egg_weight_week, livability, saleable_pct_hatch
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

  /**
   * Fetch product by ID
   * @param productId The product ID
   * @returns Product or null if not found
   */
  async findProductById(productId: number): Promise<ProductRow | null> {
    const sql = `
      SELECT id, breed
      FROM standards_products
      WHERE id = ?
    `;
    const [rows] = await query<ProductRow[] & RowDataPacket[]>(sql, [
      productId,
    ]);
    return rows.length > 0 ? rows[0] : null;
  }
}
