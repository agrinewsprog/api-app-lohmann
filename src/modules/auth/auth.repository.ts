import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { query, queryOne } from '../../db/query';
import { User, RefreshToken } from './auth.types';

export class AuthRepository {
  async createUser(
    fullname: string,
    email: string,
    passwordHash: string,
    role: 'admin' | 'user' = 'user'
  ): Promise<number> {
    const sql = `
      INSERT INTO users (fullname, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await query<ResultSetHeader>(sql, [fullname, email, passwordHash, role]);
    return result.insertId;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const sql = `
      SELECT id, fullname, email, password_hash, role, created_at, updated_at
      FROM users
      WHERE email = ?
    `;
    return queryOne<User & RowDataPacket>(sql, [email]);
  }

  async findUserById(id: number): Promise<User | null> {
    const sql = `
      SELECT id, fullname, email, password_hash, role, created_at, updated_at
      FROM users
      WHERE id = ?
    `;
    return queryOne<User & RowDataPacket>(sql, [id]);
  }

  async storeRefreshToken(
    userId: number,
    tokenHash: string,
    expiresAt: Date
  ): Promise<number> {
    const sql = `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES (?, ?, ?)
    `;
    const [result] = await query<ResultSetHeader>(sql, [userId, tokenHash, expiresAt]);
    return result.insertId;
  }

  async findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
    const sql = `
      SELECT id, user_id, token_hash, revoked_at, expires_at, created_at
      FROM refresh_tokens
      WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > NOW()
    `;
    return queryOne<RefreshToken & RowDataPacket>(sql, [tokenHash]);
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    const sql = `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE token_hash = ?
    `;
    await query(sql, [tokenHash]);
  }

  async revokeAllUserRefreshTokens(userId: number): Promise<void> {
    const sql = `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE user_id = ? AND revoked_at IS NULL
    `;
    await query(sql, [userId]);
  }

  async cleanupExpiredTokens(): Promise<void> {
    const sql = `
      DELETE FROM refresh_tokens
      WHERE expires_at < NOW() OR revoked_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;
    await query(sql);
  }
}
