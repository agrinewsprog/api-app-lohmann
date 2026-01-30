import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

interface EnvConfig {
  PORT: number;
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_PORT: number;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  CORS_ORIGIN: string;
  NODE_ENV: string;
  BETA_WEIGHT_PRODUCTS_JSON_PATH: string;
  BETA_WEIGHT_UNIFORMITY_JSON_PATH: string;
}

function validateEnv(): EnvConfig {
  const requiredEnvVars = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'DB_PORT',
    'JWT_ACCESS_SECRET',
    'JWT_ACCESS_EXPIRES_IN',
    'JWT_REFRESH_SECRET',
    'JWT_REFRESH_EXPIRES_IN',
    'CORS_ORIGIN',
    'BETA_WEIGHT_PRODUCTS_JSON_PATH',
    'BETA_WEIGHT_UNIFORMITY_JSON_PATH'
  ];

  const missingVars: string[] = [];

  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please create a .env file based on .env.example'
    );
  }

  const port = parseInt(process.env.PORT || '8089', 10);
  const dbPort = parseInt(process.env.DB_PORT!, 10);

  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error('PORT must be a valid number between 1 and 65535 (default: 8089)');
  }

  if (isNaN(dbPort) || dbPort <= 0 || dbPort > 65535) {
    throw new Error('DB_PORT must be a valid number between 1 and 65535');
  }

  if (process.env.JWT_ACCESS_SECRET!.length < 32) {
    throw new Error('JWT_ACCESS_SECRET must be at least 32 characters long');
  }

  if (process.env.JWT_REFRESH_SECRET!.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
  }

  return {
    PORT: port,
    DB_HOST: process.env.DB_HOST!,
    DB_USER: process.env.DB_USER!,
    DB_PASSWORD: process.env.DB_PASSWORD!,
    DB_NAME: process.env.DB_NAME!,
    DB_PORT: dbPort,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN!,
    CORS_ORIGIN: process.env.CORS_ORIGIN!,
    NODE_ENV: process.env.NODE_ENV || 'development',
    BETA_WEIGHT_PRODUCTS_JSON_PATH: process.env.BETA_WEIGHT_PRODUCTS_JSON_PATH!,
    BETA_WEIGHT_UNIFORMITY_JSON_PATH: process.env.BETA_WEIGHT_UNIFORMITY_JSON_PATH!
  };
}

export const env = validateEnv();
