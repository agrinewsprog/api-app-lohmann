import bcrypt from 'bcrypt';
import { AdminUsersRepository } from './adminUsers.repository';
import { AppError } from '../../../middlewares/errorHandler';
import {
  UserResponse,
  CreateUserDTO,
  UpdateUserDTO,
  AdminUserResponse,
  PaginatedUsersResponse,
  sanitizeUser,
  generatePassword,
} from './adminUsers.types';

const BCRYPT_ROUNDS = 12;

export class AdminUsersService {
  private repository: AdminUsersRepository;

  constructor() {
    this.repository = new AdminUsersRepository();
  }

  async getAllUsers(
    page: number,
    pageSize: number,
    search?: string,
    role?: 'admin' | 'user'
  ): Promise<PaginatedUsersResponse> {
    const users = await this.repository.findAll(page, pageSize, search, role);
    const total = await this.repository.countAll(search, role);

    return {
      items: users.map(sanitizeUser),
      meta: {
        page,
        pageSize,
        total,
      },
    };
  }

  async getUserById(id: number): Promise<UserResponse> {
    const user = await this.repository.findById(id);

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return sanitizeUser(user);
  }

  async createUser(data: CreateUserDTO): Promise<AdminUserResponse> {
    const existing = await this.repository.findByEmail(data.email);

    if (existing) {
      throw new AppError(409, 'A user with this email already exists');
    }

    let password = data.password;
    let generatedPassword: string | undefined;

    if (!password) {
      generatedPassword = generatePassword(12);
      password = generatedPassword;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await this.repository.create(
      data.fullname,
      data.email,
      passwordHash,
      data.role
    );

    const response: AdminUserResponse = {
      ...sanitizeUser(user),
    };

    if (generatedPassword) {
      response.generatedPassword = generatedPassword;
    }

    return response;
  }

  async updateUser(id: number, data: UpdateUserDTO): Promise<UserResponse> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new AppError(404, 'User not found');
    }

    if (data.email && data.email !== existing.email) {
      const duplicate = await this.repository.findByEmail(data.email);
      if (duplicate) {
        throw new AppError(409, 'A user with this email already exists');
      }
    }

    const updated = await this.repository.update(id, data);
    return sanitizeUser(updated!);
  }

  async deleteUser(id: number, adminId: number): Promise<void> {
    if (id === adminId) {
      throw new AppError(400, 'Cannot delete your own account');
    }

    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new AppError(404, 'User not found');
    }

    await this.repository.delete(id);
  }

  async resetPassword(id: number, newPassword?: string): Promise<{ password?: string }> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new AppError(404, 'User not found');
    }

    let password = newPassword;
    let returnPassword: string | undefined;

    if (!password) {
      password = generatePassword(12);
      returnPassword = password;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await this.repository.updatePassword(id, passwordHash);

    return returnPassword ? { password: returnPassword } : {};
  }
}
