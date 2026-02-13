export interface User {
  id: number;
  fullname: string;
  email: string;
  password_hash: string;
  role: "admin" | "user";
  country?: string;
  company?: string;
  nutrition_available?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserResponse {
  id: number;
  fullname: string;
  email: string;
  role: "admin" | "user";
  country?: string;
  company?: string;
  nutrition_available?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RegisterRequest {
  fullname: string;
  email: string;
  password: string;
  country?: string;
  company?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface UpdateProfileRequest {
  fullname: string;
  company?: string;
  country?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshToken {
  id: number;
  user_id: number;
  token_hash: string;
  revoked_at: Date | null;
  expires_at: Date;
  created_at: Date;
}

export function sanitizeUser(user: User): UserResponse {
  return {
    id: user.id,
    fullname: user.fullname,
    email: user.email,
    country: user.country,
    company: user.company,
    nutrition_available: user.nutrition_available,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}
