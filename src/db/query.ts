import { pool } from './pool';
import { RowDataPacket, ResultSetHeader, FieldPacket } from 'mysql2/promise';

export async function query<T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params?: unknown[]
): Promise<[T, FieldPacket[]]> {
  return pool.execute<T>(sql, params);
}

export async function queryOne<T extends RowDataPacket>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const [rows] = await pool.execute<T[]>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function transaction<T>(
  callback: (connection: any) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
