import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { query, queryOne } from "../../../db/query";
import { User } from "./adminUsers.types";

export class AdminUsersRepository {
  async findAll(
    page: number,
    pageSize: number,
    search?: string,
    role?: "admin" | "user",
  ): Promise<User[]> {
    let sql = `
      SELECT id, fullname, email, password_hash, role, created_at, updated_at
      FROM users
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (search) {
      sql += " AND (fullname LIKE ? OR email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role) {
      sql += " AND role = ?";
      params.push(role);
    }

    const offset = (page - 1) * pageSize;
    sql += ` ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`;

    const [rows] = await query<User[] & RowDataPacket[]>(sql, params);
    return rows;
  }

  async countAll(search?: string, role?: "admin" | "user"): Promise<number> {
    let sql = "SELECT COUNT(*) as total FROM users WHERE 1=1";
    const params: string[] = [];

    if (search) {
      sql += " AND (fullname LIKE ? OR email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role) {
      sql += " AND role = ?";
      params.push(role);
    }

    const result = await queryOne<{ total: number } & RowDataPacket>(
      sql,
      params,
    );
    return result?.total || 0;
  }

  async findById(id: number): Promise<User | null> {
    const sql = `
      SELECT id, fullname, email, password_hash, role, created_at, updated_at
      FROM users
      WHERE id = ?
    `;
    return queryOne<User & RowDataPacket>(sql, [id]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const sql = `
      SELECT id, fullname, email, password_hash, role, created_at, updated_at
      FROM users
      WHERE email = ?
    `;
    return queryOne<User & RowDataPacket>(sql, [email]);
  }

  async create(
    fullname: string,
    email: string,
    passwordHash: string,
    role: "admin" | "user",
  ): Promise<User> {
    const sql = `
      INSERT INTO users (fullname, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await query<ResultSetHeader>(sql, [
      fullname,
      email,
      passwordHash,
      role,
    ]);
    const created = await this.findById(result.insertId);
    return created!;
  }

  async update(
    id: number,
    data: { fullname?: string; email?: string; role?: "admin" | "user" },
  ): Promise<User | null> {
    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (data.fullname !== undefined) {
      fields.push("fullname = ?");
      values.push(data.fullname);
    }
    if (data.email !== undefined) {
      fields.push("email = ?");
      values.push(data.email);
    }
    if (data.role !== undefined) {
      fields.push("role = ?");
      values.push(data.role);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const sql = `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE id = ?
    `;

    await query<ResultSetHeader>(sql, values);
    return this.findById(id);
  }

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    const sql = `
      UPDATE users
      SET password_hash = ?
      WHERE id = ?
    `;
    await query<ResultSetHeader>(sql, [passwordHash, id]);
  }

  async delete(id: number): Promise<boolean> {
    const sql = "DELETE FROM users WHERE id = ?";
    const [result] = await query<ResultSetHeader>(sql, [id]);
    return result.affectedRows > 0;
  }
}
