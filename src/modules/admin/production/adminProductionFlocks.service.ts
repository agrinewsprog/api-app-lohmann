import { AdminProductionFlocksRepository } from './adminProductionFlocks.repository';
import { AppError } from '../../../middlewares/errorHandler';
import {
  AdminProductionFlockResponse,
  AdminCreateProductionFlockDTO,
  AdminUpdateProductionFlockDTO,
  PaginatedProductionFlocksResponse,
  sanitizeAdminProductionFlock,
} from './adminProductionFlocks.types';

export class AdminProductionFlocksService {
  private repository: AdminProductionFlocksRepository;

  constructor() {
    this.repository = new AdminProductionFlocksRepository();
  }

  async getAllFlocks(
    page: number,
    pageSize: number,
    userId?: number,
    search?: string
  ): Promise<PaginatedProductionFlocksResponse> {
    const flocks = await this.repository.findAll(page, pageSize, userId, search);
    const total = await this.repository.countAll(userId, search);

    return {
      items: flocks.map(sanitizeAdminProductionFlock),
      meta: {
        page,
        pageSize,
        total,
      },
    };
  }

  async getFlockById(id: number): Promise<AdminProductionFlockResponse> {
    const flock = await this.repository.findById(id);

    if (!flock) {
      throw new AppError(404, 'Flock not found');
    }

    return sanitizeAdminProductionFlock(flock);
  }

  async createFlock(data: AdminCreateProductionFlockDTO): Promise<AdminProductionFlockResponse> {
    const userExists = await this.repository.userExists(data.userId);

    if (!userExists) {
      throw new AppError(404, 'User not found');
    }

    const existing = await this.repository.findByNameAndUserId(data.name, data.userId);

    if (existing) {
      throw new AppError(409, 'A flock with this name already exists for this user');
    }

    const flock = await this.repository.create(data);
    return sanitizeAdminProductionFlock(flock);
  }

  async updateFlock(id: number, data: AdminUpdateProductionFlockDTO): Promise<AdminProductionFlockResponse> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new AppError(404, 'Flock not found');
    }

    if (data.name && data.name !== existing.name) {
      const duplicate = await this.repository.findByNameAndUserId(data.name, existing.user_id);
      if (duplicate) {
        throw new AppError(409, 'A flock with this name already exists for this user');
      }
    }

    const updated = await this.repository.update(id, data);
    return sanitizeAdminProductionFlock(updated!);
  }

  async deleteFlock(id: number): Promise<void> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new AppError(404, 'Flock not found');
    }

    await this.repository.delete(id);
  }
}
