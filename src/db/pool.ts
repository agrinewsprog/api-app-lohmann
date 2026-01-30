import mysql from 'mysql2/promise';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const poolConfig: mysql.PoolOptions = {
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  port: env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

export const pool = mysql.createPool(poolConfig);

export async function testConnection(): Promise<void> {
  try {
    const connection = await pool.getConnection();
    logger.info('Database connection established successfully');
    connection.release();
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw new Error('Database connection failed');
  }
}
