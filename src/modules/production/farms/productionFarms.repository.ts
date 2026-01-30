import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { query, queryOne } from '../../../db/query';
import { ProductionFarm, CreateProductionFarmDTO, UpdateProductionFarmDTO } from './productionFarms.types';

export class ProductionFarmsRepository {
  async findAllByUserId(userId: number): Promise<ProductionFarm[]> {
    const sql = `
      SELECT id, user_id, name, created_at, updated_at
      FROM production_farms
      WHERE user_id = ?
      ORDER BY name ASC
    `;
    const [rows] = await query<ProductionFarm[] & RowDataPacket[]>(sql, [userId]);
    return rows;
  }

  async findByIdAndUserId(id: number, userId: number): Promise<ProductionFarm | null> {
    const sql = `
      SELECT id, user_id, name, created_at, updated_at
      FROM production_farms
      WHERE id = ? AND user_id = ?
    `;
    return queryOne<ProductionFarm & RowDataPacket>(sql, [id, userId]);
  }

  async findByNameAndUserId(name: string, userId: number): Promise<ProductionFarm | null> {
    const sql = `
      SELECT id, user_id, name, created_at, updated_at
      FROM production_farms
      WHERE name = ? AND user_id = ?
    `;
    return queryOne<ProductionFarm & RowDataPacket>(sql, [name, userId]);
  }

  async create(userId: number, data: CreateProductionFarmDTO): Promise<ProductionFarm> {
    const sql = `
      INSERT INTO production_farms (user_id, name)
      VALUES (?, ?)
    `;
    const [result] = await query<ResultSetHeader>(sql, [userId, data.name]);

    const created = await this.findByIdAndUserId(result.insertId, userId);
    return created!;
  }

  async update(id: number, userId: number, data: UpdateProductionFarmDTO): Promise<ProductionFarm | null> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }

    if (fields.length === 0) {
      return this.findByIdAndUserId(id, userId);
    }

    values.push(id, userId);

    const sql = `
      UPDATE production_farms
      SET ${fields.join(', ')}
      WHERE id = ? AND user_id = ?
    `;

    await query<ResultSetHeader>(sql, values);
    return this.findByIdAndUserId(id, userId);
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const sql = `
      DELETE FROM production_farms
      WHERE id = ? AND user_id = ?
    `;
    const [result] = await query<ResultSetHeader>(sql, [id, userId]);
    return result.affectedRows > 0;
  }

  async hasFlocks(farmId: number): Promise<boolean> {
    const sql = `
      SELECT COUNT(*) as count
      FROM production_flocks
      WHERE farm_id = ?
    `;
    const result = await queryOne<{ count: number } & RowDataPacket>(sql, [farmId]);
    return result ? result.count > 0 : false;
  }
}
