import { RowDataPacket } from "mysql2/promise";
import { query } from "../../../db/query";

export interface UniformityRecord extends RowDataPacket {
  id: number;
  flock_id: number;
  week: number;
  sex: "female" | "male";
  weights: string;
  avg_weight: number;
  coefficient_variation: number;
  uniformity_percentage: number;
  created_at: string;
}

export class AdminWeightUniformityRepository {
  async getHistory(flockId: number, sex?: "female" | "male"): Promise<any[]> {
    let sql = `
      SELECT 
        id,
        flock_id,
        week,
        sex,
        weights,
        mean_weight as avg_weight,
        cv as coefficient_variation,
        uniformity as uniformity_percentage,
        created_at
      FROM weight_measurements
      WHERE flock_id = ?
    `;

    const params: any[] = [flockId];

    if (sex) {
      sql += " AND sex = ?";
      params.push(sex);
    }

    sql += " ORDER BY week DESC, sex ASC";

    const [rows] = await query<any[]>(sql, params);

    // Parse weights JSON string
    return rows.map((row: any) => ({
      ...row,
      weights:
        typeof row.weights === "string" ? JSON.parse(row.weights) : row.weights,
    }));
  }

  async getWeek(
    flockId: number,
    week: number,
    sex: "female" | "male",
  ): Promise<any | null> {
    const sql = `
      SELECT
        id,
        flock_id,
        week,
        sex,
        weights,
        mean_weight as avg_weight,
        cv as coefficient_variation,
        uniformity as uniformity_percentage,
        created_at
      FROM weight_measurements
      WHERE flock_id = ? AND week = ? AND sex = ?
      LIMIT 1
    `;

    const [rows] = await query<any[]>(sql, [flockId, week, sex]);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      ...row,
      weights:
        typeof row.weights === "string" ? JSON.parse(row.weights) : row.weights,
    };
  }

  async saveWeek(
    flockId: number,
    userId: number,
    week: number,
    sex: "female" | "male",
    weights: number[],
    sampleCount: number,
    meanWeight: number,
    stdDev: number,
    cv: number,
    uniformity: number,
  ): Promise<any> {
    const weightsJson = JSON.stringify(weights);

    const upsertSql = `
      INSERT INTO weight_measurements (flock_id, user_id, week, sex, weights, sample_count, mean_weight, std_dev, cv, uniformity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        weights = VALUES(weights),
        sample_count = VALUES(sample_count),
        mean_weight = VALUES(mean_weight),
        std_dev = VALUES(std_dev),
        cv = VALUES(cv),
        uniformity = VALUES(uniformity),
        updated_at = CURRENT_TIMESTAMP
    `;

    await query(upsertSql, [
      flockId, userId, week, sex, weightsJson,
      sampleCount, meanWeight, stdDev, cv, uniformity,
    ]);

    return this.getWeek(flockId, week, sex);
  }
}
