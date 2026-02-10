import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { query, queryOne } from '../../../db/query';
import { WeightMeasurementRow } from './weightUniformity.types';

export class WeightUniformityRepository {
  async findByFlockWeekSex(
    flockId: number,
    week: number,
    sex: 'female' | 'male',
  ): Promise<WeightMeasurementRow | null> {
    const sql = `
      SELECT id, flock_id, user_id, week, sex, weights, sample_count,
             mean_weight, std_dev, cv, uniformity, created_at, updated_at
      FROM weight_measurements
      WHERE flock_id = ? AND week = ? AND sex = ?
    `;
    return queryOne<WeightMeasurementRow & RowDataPacket>(sql, [flockId, week, sex]);
  }

  async upsert(
    flockId: number,
    userId: number,
    week: number,
    sex: 'female' | 'male',
    weights: number[],
    sampleCount: number,
    meanWeight: number,
    stdDev: number,
    cv: number,
    uniformity: number,
  ): Promise<WeightMeasurementRow> {
    const weightsJson = JSON.stringify(weights);

    const sql = `
      INSERT INTO weight_measurements (flock_id, user_id, week, sex, weights, sample_count, mean_weight, std_dev, cv, uniformity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        user_id = VALUES(user_id),
        weights = VALUES(weights),
        sample_count = VALUES(sample_count),
        mean_weight = VALUES(mean_weight),
        std_dev = VALUES(std_dev),
        cv = VALUES(cv),
        uniformity = VALUES(uniformity),
        updated_at = CURRENT_TIMESTAMP
    `;

    await query<ResultSetHeader>(sql, [
      flockId, userId, week, sex, weightsJson,
      sampleCount, meanWeight, stdDev, cv, uniformity,
    ]);

    const row = await this.findByFlockWeekSex(flockId, week, sex);
    return row!;
  }

  async findAllByFlockId(flockId: number): Promise<WeightMeasurementRow[]> {
    const sql = `
      SELECT id, flock_id, user_id, week, sex, weights, sample_count,
             mean_weight, std_dev, cv, uniformity, created_at, updated_at
      FROM weight_measurements
      WHERE flock_id = ?
      ORDER BY week ASC, sex ASC
    `;
    const [rows] = await query<WeightMeasurementRow[] & RowDataPacket[]>(sql, [flockId]);
    return rows;
  }

  async findAllByFlockIdAndSex(
    flockId: number,
    sex: 'female' | 'male',
  ): Promise<WeightMeasurementRow[]> {
    const sql = `
      SELECT id, flock_id, user_id, week, sex, weights, sample_count,
             mean_weight, std_dev, cv, uniformity, created_at, updated_at
      FROM weight_measurements
      WHERE flock_id = ? AND sex = ?
      ORDER BY week ASC
    `;
    const [rows] = await query<WeightMeasurementRow[] & RowDataPacket[]>(sql, [flockId, sex]);
    return rows;
  }
}
