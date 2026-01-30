import { User, UserResponse, sanitizeUser } from '../../auth/auth.types';

export { User, UserResponse, sanitizeUser };

export interface CreateUserDTO {
  fullname: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
}

export interface UpdateUserDTO {
  fullname?: string;
  email?: string;
  role?: 'admin' | 'user';
}

export interface AdminUserResponse extends UserResponse {
  generatedPassword?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginatedUsersResponse {
  items: UserResponse[];
  meta: PaginationMeta;
}

export function generatePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  const all = uppercase + lowercase + numbers + special;

  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  for (let i = 4; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  return password.split('').sort(() => Math.random() - 0.5).join('');
}
