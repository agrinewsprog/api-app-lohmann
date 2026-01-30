import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { query, queryOne } from '../../../db/query';
import { WeightFlock, CreateWeightFlockDTO, UpdateWeightFlockDTO } from './weightFlocks.types';

export class WeightFlocksRepository {
  async findAllByUserId(userId: number): Promise<WeightFlock[]> {
    const sql = `
      SELECT id, user_id, name, location, notes, created_at, updated_at
      FROM weight_flocks
      WHERE user_id = ?
      ORDER BY name ASC
    `;
    const [rows] = await query<WeightFlock[] & RowDataPacket[]>(sql, [userId]);
    return rows;
  }

  async findByIdAndUserId(id: number, userId: number): Promise<WeightFlock | null> {
    const sql = `
      SELECT id, user_id, name, location, notes, created_at, updated_at
      FROM weight_flocks
      WHERE id = ? AND user_id = ?
    `;
    return queryOne<WeightFlock & RowDataPacket>(sql, [id, userId]);
  }

  async findByNameAndUserId(name: string, userId: number): Promise<WeightFlock | null> {
    const sql = `
      SELECT id, user_id, name, location, notes, created_at, updated_at
      FROM weight_flocks
      WHERE name = ? AND user_id = ?
    `;
    return queryOne<WeightFlock & RowDataPacket>(sql, [name, userId]);
  }

  async create(userId: number, data: CreateWeightFlockDTO): Promise<WeightFlock> {
    const sql = `
      INSERT INTO weight_flocks (user_id, name, location, notes)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await query<ResultSetHeader>(sql, [
      userId,
      data.name,
      data.location || null,
      data.notes || null,
    ]);

    const created = await this.findByIdAndUserId(result.insertId, userId);
    return created!;
  }

  async update(id: number, userId: number, data: UpdateWeightFlockDTO): Promise<WeightFlock | null> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.location !== undefined) {
      fields.push('location = ?');
      values.push(data.location || null);
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes || null);
    }

    if (fields.length === 0) {
      return this.findByIdAndUserId(id, userId);
    }

    values.push(id, userId);

    const sql = `
      UPDATE weight_flocks
      SET ${fields.join(', ')}
      WHERE id = ? AND user_id = ?
    `;

    await query<ResultSetHeader>(sql, values);
    return this.findByIdAndUserId(id, userId);
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const sql = `
      DELETE FROM weight_flocks
      WHERE id = ? AND user_id = ?
    `;
    const [result] = await query<ResultSetHeader>(sql, [id, userId]);
    return result.affectedRows > 0;
  }
}
