import { ProductionFarmsRepository } from './productionFarms.repository';
import { AppError } from '../../../middlewares/errorHandler';
import {
  ProductionFarmResponse,
  CreateProductionFarmDTO,
  UpdateProductionFarmDTO,
  sanitizeProductionFarm,
} from './productionFarms.types';

export class ProductionFarmsService {
  private repository: ProductionFarmsRepository;

  constructor() {
    this.repository = new ProductionFarmsRepository();
  }

  async getAllFarms(userId: number): Promise<ProductionFarmResponse[]> {
    const farms = await this.repository.findAllByUserId(userId);
    return farms.map(sanitizeProductionFarm);
  }

  async getFarmById(id: number, userId: number): Promise<ProductionFarmResponse> {
    const farm = await this.repository.findByIdAndUserId(id, userId);

    if (!farm) {
      throw new AppError(404, 'Farm not found');
    }

    return sanitizeProductionFarm(farm);
  }

  async createFarm(userId: number, data: CreateProductionFarmDTO): Promise<ProductionFarmResponse> {
    const existing = await this.repository.findByNameAndUserId(data.name, userId);

    if (existing) {
      throw new AppError(409, 'A farm with this name already exists');
    }

    const farm = await this.repository.create(userId, data);
    return sanitizeProductionFarm(farm);
  }

  async updateFarm(id: number, userId: number, data: UpdateProductionFarmDTO): Promise<ProductionFarmResponse> {
    const existing = await this.repository.findByIdAndUserId(id, userId);

    if (!existing) {
      throw new AppError(404, 'Farm not found');
    }

    if (data.name && data.name !== existing.name) {
      const duplicate = await this.repository.findByNameAndUserId(data.name, userId);
      if (duplicate) {
        throw new AppError(409, 'A farm with this name already exists');
      }
    }

    const updated = await this.repository.update(id, userId, data);
    return sanitizeProductionFarm(updated!);
  }

  async deleteFarm(id: number, userId: number): Promise<void> {
    const existing = await this.repository.findByIdAndUserId(id, userId);

    if (!existing) {
      throw new AppError(404, 'Farm not found');
    }

    const hasFlocks = await this.repository.hasFlocks(id);
    if (hasFlocks) {
      throw new AppError(409, 'Cannot delete farm with associated flocks. Please delete or reassign the flocks first.');
    }

    await this.repository.delete(id, userId);
  }
}
