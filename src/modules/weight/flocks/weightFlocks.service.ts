import { WeightFlocksRepository } from './weightFlocks.repository';
import { AppError } from '../../../middlewares/errorHandler';
import {
  WeightFlockResponse,
  CreateWeightFlockDTO,
  UpdateWeightFlockDTO,
  sanitizeWeightFlock,
} from './weightFlocks.types';

export class WeightFlocksService {
  private repository: WeightFlocksRepository;

  constructor() {
    this.repository = new WeightFlocksRepository();
  }

  async getAllFlocks(userId: number): Promise<WeightFlockResponse[]> {
    const flocks = await this.repository.findAllByUserId(userId);
    return flocks.map(sanitizeWeightFlock);
  }

  async getFlockById(id: number, userId: number): Promise<WeightFlockResponse> {
    const flock = await this.repository.findByIdAndUserId(id, userId);

    if (!flock) {
      throw new AppError(404, 'Flock not found');
    }

    return sanitizeWeightFlock(flock);
  }

  async createFlock(userId: number, data: CreateWeightFlockDTO): Promise<WeightFlockResponse> {
    const existing = await this.repository.findByNameAndUserId(data.name, userId);

    if (existing) {
      throw new AppError(409, 'A flock with this name already exists');
    }

    const flock = await this.repository.create(userId, data);
    return sanitizeWeightFlock(flock);
  }

  async updateFlock(id: number, userId: number, data: UpdateWeightFlockDTO): Promise<WeightFlockResponse> {
    const existing = await this.repository.findByIdAndUserId(id, userId);

    if (!existing) {
      throw new AppError(404, 'Flock not found');
    }

    if (data.name && data.name !== existing.name) {
      const duplicate = await this.repository.findByNameAndUserId(data.name, userId);
      if (duplicate) {
        throw new AppError(409, 'A flock with this name already exists');
      }
    }

    const updated = await this.repository.update(id, userId, data);
    return sanitizeWeightFlock(updated!);
  }

  async deleteFlock(id: number, userId: number): Promise<void> {
    const existing = await this.repository.findByIdAndUserId(id, userId);

    if (!existing) {
      throw new AppError(404, 'Flock not found');
    }

    await this.repository.delete(id, userId);
  }
}
