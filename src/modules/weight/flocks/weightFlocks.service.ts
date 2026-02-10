import { WeightFlocksRepository } from './weightFlocks.repository';
import { StandardsRepository } from '../../standards/standards.repository';
import { AppError } from '../../../middlewares/errorHandler';
import {
  WeightFlockResponse,
  CreateWeightFlockDTO,
  UpdateWeightFlockDTO,
  sanitizeWeightFlock,
} from './weightFlocks.types';

export class WeightFlocksService {
  private repository: WeightFlocksRepository;
  private standardsRepository: StandardsRepository;

  constructor() {
    this.repository = new WeightFlocksRepository();
    this.standardsRepository = new StandardsRepository();
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

    if (data.productId) {
      await this.validateProductId(data.productId);
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

    if (data.productId) {
      await this.validateProductId(data.productId);
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

  private async validateProductId(productId: number): Promise<void> {
    const product = await this.standardsRepository.findProductById(productId);
    if (!product) {
      throw new AppError(400, 'Invalid product_id: product not found');
    }
  }
}
