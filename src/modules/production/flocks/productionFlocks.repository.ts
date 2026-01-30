import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { query, queryOne } from '../../../db/query';
import { ProductionFlock, ProductionFlockWithFarm, CreateProductionFlockDTO, UpdateProductionFlockDTO } from './productionFlocks.types';

export class ProductionFlocksRepository {
  async findAllByUserId(userId: number, farmId?: number): Promise<ProductionFlockWithFarm[]> {
    let sql = `
      SELECT
        f.id, f.user_id, f.farm_id, f.name, f.flock_number, f.hatch_date,
        f.hens_housed, f.production_period, f.product_id, f.location, f.notes,
        f.created_at, f.updated_at,
        pf.name as farm_name
      FROM production_flocks f
      LEFT JOIN production_farms pf ON f.farm_id = pf.id
      WHERE f.user_id = ?
    `;
    const params: (number)[] = [userId];

    if (farmId) {
      sql += ' AND f.farm_id = ?';
      params.push(farmId);
    }

    sql += ' ORDER BY f.name ASC';

    const [rows] = await query<ProductionFlockWithFarm[] & RowDataPacket[]>(sql, params);
    return rows;
  }

  async findByIdAndUserId(id: number, userId: number): Promise<ProductionFlockWithFarm | null> {
    const sql = `
      SELECT
        f.id, f.user_id, f.farm_id, f.name, f.flock_number, f.hatch_date,
        f.hens_housed, f.production_period, f.product_id, f.location, f.notes,
        f.created_at, f.updated_at,
        pf.name as farm_name
      FROM production_flocks f
      LEFT JOIN production_farms pf ON f.farm_id = pf.id
      WHERE f.id = ? AND f.user_id = ?
    `;
    return queryOne<ProductionFlockWithFarm & RowDataPacket>(sql, [id, userId]);
  }

  async findByNameAndUserId(name: string, userId: number): Promise<ProductionFlock | null> {
    const sql = `
      SELECT id, user_id, farm_id, name, flock_number, hatch_date,
        hens_housed, production_period, product_id, location, notes,
        created_at, updated_at
      FROM production_flocks
      WHERE name = ? AND user_id = ?
    `;
    return queryOne<ProductionFlock & RowDataPacket>(sql, [name, userId]);
  }

  async create(userId: number, data: CreateProductionFlockDTO): Promise<ProductionFlockWithFarm> {
    const sql = `
      INSERT INTO production_flocks
        (user_id, farm_id, name, flock_number, hatch_date, hens_housed, production_period, product_id, location, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await query<ResultSetHeader>(sql, [
      userId,
      data.farmId || null,
      data.name,
      data.flockNumber || null,
      data.hatchDate || null,
      data.hensHoused ?? 0,
      data.productionPeriod ?? 72,
      data.productId || null,
      data.location || null,
      data.notes || null,
    ]);

    const created = await this.findByIdAndUserId(result.insertId, userId);
    return created!;
  }

  async update(id: number, userId: number, data: UpdateProductionFlockDTO): Promise<ProductionFlockWithFarm | null> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.farmId !== undefined) {
      fields.push('farm_id = ?');
      values.push(data.farmId || null);
    }
    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.flockNumber !== undefined) {
      fields.push('flock_number = ?');
      values.push(data.flockNumber || null);
    }
    if (data.hatchDate !== undefined) {
      fields.push('hatch_date = ?');
      values.push(data.hatchDate || null);
    }
    if (data.hensHoused !== undefined) {
      fields.push('hens_housed = ?');
      values.push(data.hensHoused);
    }
    if (data.productionPeriod !== undefined) {
      fields.push('production_period = ?');
      values.push(data.productionPeriod);
    }
    if (data.productId !== undefined) {
      fields.push('product_id = ?');
      values.push(data.productId || null);
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
      UPDATE production_flocks
      SET ${fields.join(', ')}
      WHERE id = ? AND user_id = ?
    `;

    await query<ResultSetHeader>(sql, values);
    return this.findByIdAndUserId(id, userId);
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const sql = `
      DELETE FROM production_flocks
      WHERE id = ? AND user_id = ?
    `;
    const [result] = await query<ResultSetHeader>(sql, [id, userId]);
    return result.affectedRows > 0;
  }
}
