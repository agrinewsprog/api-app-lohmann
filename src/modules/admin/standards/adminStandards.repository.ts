import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { query, queryOne } from "../../../db/query";
import { StandardsGrowth } from "../../standards/standards.types";

export class AdminStandardsRepository {
  async findGrowthById(id: number): Promise<StandardsGrowth | null> {
    const sql = `
      SELECT *
      FROM standards_growth
      WHERE id = ?
    `;
    return queryOne<StandardsGrowth & RowDataPacket>(sql, [id]);
  }

  async createGrowth(
    productId: number,
    week: number,
    sex: "female" | "male",
    minValue: number,
    avgValue: number,
    maxValue: number,
  ): Promise<number> {
    const sql = `
      INSERT INTO standards_growth (product_id, week, sex, min_value, avg_value, max_value)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await query<ResultSetHeader>(sql, [
      productId,
      week,
      sex,
      minValue,
      avgValue,
      maxValue,
    ]);
    return result.insertId;
  }

  async updateGrowth(
    id: number,
    updates: {
      minValue?: number;
      avgValue?: number;
      maxValue?: number;
    },
  ): Promise<void> {
    const fields: string[] = [];
    const params: number[] = [];

    if (updates.minValue !== undefined) {
      fields.push("min_value = ?");
      params.push(updates.minValue);
    }
    if (updates.avgValue !== undefined) {
      fields.push("avg_value = ?");
      params.push(updates.avgValue);
    }
    if (updates.maxValue !== undefined) {
      fields.push("max_value = ?");
      params.push(updates.maxValue);
    }

    if (fields.length === 0) {
      return;
    }

    fields.push("updated_at = CURRENT_TIMESTAMP");
    params.push(id);

    const sql = `UPDATE standards_growth SET ${fields.join(", ")} WHERE id = ?`;
    await query(sql, params);
  }

  async deleteGrowth(id: number): Promise<boolean> {
    const sql = "DELETE FROM standards_growth WHERE id = ?";
    const [result] = await query<ResultSetHeader>(sql, [id]);
    return result.affectedRows > 0;
  }

  async checkDuplicateWeek(
    productId: number,
    week: number,
    sex: "female" | "male",
  ): Promise<boolean> {
    const sql = `
      SELECT id FROM standards_growth
      WHERE product_id = ? AND week = ? AND sex = ?
      LIMIT 1
    `;
    const result = await queryOne<RowDataPacket>(sql, [productId, week, sex]);
    return result !== null;
  }
}
