import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { query, queryOne } from "../../../db/query";
import {
  ProductionFlock,
  AdminCreateProductionFlockDTO,
  AdminUpdateProductionFlockDTO,
} from "./adminProductionFlocks.types";

export class AdminProductionFlocksRepository {
  async findAll(
    page: number,
    pageSize: number,
    userId?: number,
    search?: string,
  ): Promise<ProductionFlock[]> {
    let sql = `
      SELECT id, user_id, name, location, notes, created_at, updated_at
      FROM production_flocks
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (userId) {
      sql += " AND user_id = ?";
      params.push(userId);
    }

    if (search) {
      sql += " AND name LIKE ?";
      params.push(`%${search}%`);
    }

    const offset = (page - 1) * pageSize;
    sql += ` ORDER BY name ASC LIMIT ${pageSize} OFFSET ${offset}`;

    const [rows] = await query<ProductionFlock[] & RowDataPacket[]>(
      sql,
      params,
    );
    return rows;
  }

  async countAll(userId?: number, search?: string): Promise<number> {
    let sql = "SELECT COUNT(*) as total FROM production_flocks WHERE 1=1";
    const params: (string | number)[] = [];

    if (userId) {
      sql += " AND user_id = ?";
      params.push(userId);
    }

    if (search) {
      sql += " AND name LIKE ?";
      params.push(`%${search}%`);
    }

    const result = await queryOne<{ total: number } & RowDataPacket>(
      sql,
      params,
    );
    return result?.total || 0;
  }

  async findById(id: number): Promise<ProductionFlock | null> {
    const sql = `
      SELECT id, user_id, name, location, notes, created_at, updated_at
      FROM production_flocks
      WHERE id = ?
    `;
    return queryOne<ProductionFlock & RowDataPacket>(sql, [id]);
  }

  async findByNameAndUserId(
    name: string,
    userId: number,
  ): Promise<ProductionFlock | null> {
    const sql = `
      SELECT id, user_id, name, location, notes, created_at, updated_at
      FROM production_flocks
      WHERE name = ? AND user_id = ?
    `;
    return queryOne<ProductionFlock & RowDataPacket>(sql, [name, userId]);
  }

  async create(data: AdminCreateProductionFlockDTO): Promise<ProductionFlock> {
    const sql = `
      INSERT INTO production_flocks (user_id, name, location, notes)
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

  async update(
    id: number,
    data: AdminUpdateProductionFlockDTO,
  ): Promise<ProductionFlock | null> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.name !== undefined) {
      fields.push("name = ?");
      values.push(data.name);
    }
    if (data.location !== undefined) {
      fields.push("location = ?");
      values.push(data.location || null);
    }
    if (data.notes !== undefined) {
      fields.push("notes = ?");
      values.push(data.notes || null);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const sql = `
      UPDATE production_flocks
      SET ${fields.join(", ")}
      WHERE id = ?
    `;

    await query<ResultSetHeader>(sql, values);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const sql = "DELETE FROM production_flocks WHERE id = ?";
    const [result] = await query<ResultSetHeader>(sql, [id]);
    return result.affectedRows > 0;
  }

  async userExists(userId: number): Promise<boolean> {
    const sql = "SELECT id FROM users WHERE id = ?";
    const result = await queryOne<{ id: number } & RowDataPacket>(sql, [
      userId,
    ]);
    return result !== null;
  }
}
