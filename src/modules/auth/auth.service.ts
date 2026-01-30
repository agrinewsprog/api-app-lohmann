import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { AppError } from '../../middlewares/errorHandler';
import { env } from '../../config/env';
import { hashToken } from '../../utils/crypto';
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshTokenResponse,
  sanitizeUser
} from './auth.types';
import { JwtPayload } from '../../middlewares/auth';

export class AuthService {
  private authRepository: AuthRepository;
  private readonly SALT_ROUNDS = 12;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  private generateAccessToken(userId: number, role: 'admin' | 'user'): string {
    const payload: JwtPayload = { id: userId, role };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as string
    } as jwt.SignOptions);
  }

  private generateRefreshToken(userId: number, role: 'admin' | 'user'): string {
    const payload: JwtPayload = { id: userId, role };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as string
    } as jwt.SignOptions);
  }

  private calculateRefreshTokenExpiry(): Date {
    const expiresIn = env.JWT_REFRESH_EXPIRES_IN;
    const match = expiresIn.match(/^(\d+)([smhd])$/);

    if (!match) {
      throw new Error('Invalid JWT_REFRESH_EXPIRES_IN format');
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const now = new Date();

    switch (unit) {
      case 's':
        return new Date(now.getTime() + value * 1000);
      case 'm':
        return new Date(now.getTime() + value * 60 * 1000);
      case 'h':
        return new Date(now.getTime() + value * 60 * 60 * 1000);
      case 'd':
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      default:
        throw new Error('Invalid time unit in JWT_REFRESH_EXPIRES_IN');
    }
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const existingUser = await this.authRepository.findUserByEmail(data.email);

    if (existingUser) {
      throw new AppError(409, 'Email already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    const userId = await this.authRepository.createUser(
      data.fullname,
      data.email,
      passwordHash,
      'user'
    );

    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new AppError(500, 'Failed to create user');
    }

    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = this.generateRefreshToken(user.id, user.role);

    const tokenHash = hashToken(refreshToken);
    const expiresAt = this.calculateRefreshTokenExpiry();

    await this.authRepository.storeRefreshToken(user.id, tokenHash, expiresAt);

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const user = await this.authRepository.findUserByEmail(data.email);

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);

    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = this.generateRefreshToken(user.id, user.role);

    const tokenHash = hashToken(refreshToken);
    const expiresAt = this.calculateRefreshTokenExpiry();

    await this.authRepository.storeRefreshToken(user.id, tokenHash, expiresAt);

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }

  async refresh(refreshToken: string): Promise<RefreshTokenResponse> {
    let decoded: JwtPayload;

    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError(401, 'Refresh token has expired');
      }
      throw new AppError(401, 'Invalid refresh token');
    }

    const tokenHash = hashToken(refreshToken);
    const storedToken = await this.authRepository.findRefreshToken(tokenHash);

    if (!storedToken) {
      throw new AppError(401, 'Invalid or revoked refresh token');
    }

    await this.authRepository.revokeRefreshToken(tokenHash);

    const user = await this.authRepository.findUserById(decoded.id);

    if (!user) {
      throw new AppError(401, 'User not found');
    }

    const newAccessToken = this.generateAccessToken(user.id, user.role);
    const newRefreshToken = this.generateRefreshToken(user.id, user.role);

    const newTokenHash = hashToken(newRefreshToken);
    const newExpiresAt = this.calculateRefreshTokenExpiry();

    await this.authRepository.storeRefreshToken(user.id, newTokenHash, newExpiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch (error) {
      // Best effort - still try to revoke even if token is invalid/expired
    }

    const tokenHash = hashToken(refreshToken);
    await this.authRepository.revokeRefreshToken(tokenHash);
  }

  async getMe(userId: number): Promise<AuthResponse['user']> {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return sanitizeUser(user);
  }
}
