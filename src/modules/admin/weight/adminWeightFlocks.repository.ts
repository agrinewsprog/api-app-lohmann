import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { query, queryOne } from '../../../db/query';
import { WeightFlock, AdminCreateWeightFlockDTO, AdminUpdateWeightFlockDTO } from './adminWeightFlocks.types';

export class AdminWeightFlocksRepository {
  async findAll(
    page: number,
    pageSize: number,
    userId?: number,
    search?: string
  ): Promise<WeightFlock[]> {
    let sql = `
      SELECT id, user_id, name, location, notes, created_at, updated_at
      FROM weight_flocks
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }

    if (search) {
      sql += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY name ASC LIMIT ? OFFSET ?';
    params.push(pageSize, (page - 1) * pageSize);

    const [rows] = await query<WeightFlock[] & RowDataPacket[]>(sql, params);
    return rows;
  }

  async countAll(userId?: number, search?: string): Promise<number> {
    let sql = 'SELECT COUNT(*) as total FROM weight_flocks WHERE 1=1';
    const params: (string | number)[] = [];

    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }

    if (search) {
      sql += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    const result = await queryOne<{ total: number } & RowDataPacket>(sql, params);
    return result?.total || 0;
  }

  async findById(id: number): Promise<WeightFlock | null> {
    const sql = `
      SELECT id, user_id, name, location, notes, created_at, updated_at
      FROM weight_flocks
      WHERE id = ?
    `;
    return queryOne<WeightFlock & RowDataPacket>(sql, [id]);
  }

  async findByNameAndUserId(name: string, userId: number): Promise<WeightFlock | null> {
    const sql = `
      SELECT id, user_id, name, location, notes, created_at, updated_at
      FROM weight_flocks
      WHERE name = ? AND user_id = ?
    `;
    return queryOne<WeightFlock & RowDataPacket>(sql, [name, userId]);
  }

  async create(data: AdminCreateWeightFlockDTO): Promise<WeightFlock> {
    const sql = `
      INSERT INTO weight_flocks (user_id, name, location, notes)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await query<ResultSetHeader>(sql, [
      data.userId,
      data.name,
      data.location || null,
      data.notes || null,
    ]);

    const created = await this.findById(result.insertId);
    return created!;
  }

  async update(id: number, data: AdminUpdateWeightFlockDTO): Promise<WeightFlock | null> {
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
      return this.findById(id);
    }

    values.push(id);

    const sql = `
      UPDATE weight_flocks
      SET ${fields.join(', ')}
      WHERE id = ?
    `;

    await query<ResultSetHeader>(sql, values);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM weight_flocks WHERE id = ?';
    const [result] = await query<ResultSetHeader>(sql, [id]);
    return result.affectedRows > 0;
  }

  async userExists(userId: number): Promise<boolean> {
    const sql = 'SELECT id FROM users WHERE id = ?';
    const result = await queryOne<{ id: number } & RowDataPacket>(sql, [userId]);
    return result !== null;
  }
}
