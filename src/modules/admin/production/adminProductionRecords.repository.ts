import { RowDataPacket } from "mysql2/promise";
import { query } from "../../../db/query";

export interface ProductionRecord extends RowDataPacket {
  id: number;
  flock_id: number;
  week: number;
  date: string;
  eggs_collected: number;
  mortality: number;
  feed_consumed: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export class AdminProductionRecordsRepository {
  async getByFlock(flockId: number): Promise<ProductionRecord[]> {
    const sql = `
      SELECT 
        id,
        flock_id,
        week,
        date,
        eggs_collected,
        mortality,
        feed_consumed,
        notes,
        created_at,
        updated_at
      FROM production_records
      WHERE flock_id = ?
      ORDER BY date DESC, week DESC
    `;

    const [rows] = await query<ProductionRecord[]>(sql, [flockId]);
    return rows;
  }
}
