import { ProductionFlocksRepository } from "./productionFlocks.repository";
import { ProductionFarmsRepository } from "../farms/productionFarms.repository";
import { ProductionProductsRepository } from "../products/productionProducts.repository";
import { AppError } from "../../../middlewares/errorHandler";
import {
  ProductionFlockResponse,
  CreateProductionFlockDTO,
  UpdateProductionFlockDTO,
  sanitizeProductionFlock,
} from "./productionFlocks.types";

export class ProductionFlocksService {
  private repository: ProductionFlocksRepository;
  private farmsRepository: ProductionFarmsRepository;
  private productsRepository: ProductionProductsRepository;

  constructor() {
    this.repository = new ProductionFlocksRepository();
    this.farmsRepository = new ProductionFarmsRepository();
    this.productsRepository = new ProductionProductsRepository();
  }

  async getAllFlocks(
    userId: number,
    farmId?: number
  ): Promise<ProductionFlockResponse[]> {
    const flocks = await this.repository.findAllByUserId(userId, farmId);
    return flocks.map(sanitizeProductionFlock);
  }

  async getFlockById(id: number, userId: number): Promise<ProductionFlockResponse> {
    const flock = await this.repository.findByIdAndUserId(id, userId);

    if (!flock) {
      throw new AppError(404, "Flock not found");
    }

    return sanitizeProductionFlock(flock);
  }

  async createFlock(
    userId: number,
    data: CreateProductionFlockDTO
  ): Promise<ProductionFlockResponse> {
    const existing = await this.repository.findByNameAndUserId(data.name, userId);

    if (existing) {
      throw new AppError(409, "A flock with this name already exists");
    }

    // Validate farm ownership if farmId is provided
    if (data.farmId) {
      const farm = await this.farmsRepository.findByIdAndUserId(
        data.farmId,
        userId
      );
      if (!farm) {
        throw new AppError(400, "Farm not found or does not belong to you");
      }
    }

    // Validate productId exists in database if provided
    if (data.productId) {
      const productId = parseInt(data.productId, 10);
      if (isNaN(productId)) {
        throw new AppError(400, "Invalid productId format");
      }
      const product = await this.productsRepository.findById(productId);
      if (!product) {
        throw new AppError(400, "Invalid productId: product not found");
      }
    }

    const flock = await this.repository.create(userId, data);
    return sanitizeProductionFlock(flock);
  }

  async updateFlock(
    id: number,
    userId: number,
    data: UpdateProductionFlockDTO
  ): Promise<ProductionFlockResponse> {
    const existing = await this.repository.findByIdAndUserId(id, userId);

    if (!existing) {
      throw new AppError(404, "Flock not found");
    }

    if (data.name && data.name !== existing.name) {
      const duplicate = await this.repository.findByNameAndUserId(
        data.name,
        userId
      );
      if (duplicate) {
        throw new AppError(409, "A flock with this name already exists");
      }
    }

    // Validate farm ownership if farmId is being changed
    if (data.farmId !== undefined && data.farmId !== existing.farm_id) {
      if (data.farmId) {
        const farm = await this.farmsRepository.findByIdAndUserId(
          data.farmId,
          userId
        );
        if (!farm) {
          throw new AppError(400, "Farm not found or does not belong to you");
        }
      }
    }

    // Validate productId exists in database if being changed
    if (data.productId !== undefined && data.productId !== existing.product_id) {
      if (data.productId) {
        const productId = parseInt(data.productId, 10);
        if (isNaN(productId)) {
          throw new AppError(400, "Invalid productId format");
        }
        const product = await this.productsRepository.findById(productId);
        if (!product) {
          throw new AppError(400, "Invalid productId: product not found");
        }
      }
    }

    const updated = await this.repository.update(id, userId, data);
    return sanitizeProductionFlock(updated!);
  }

  async deleteFlock(id: number, userId: number): Promise<void> {
    const existing = await this.repository.findByIdAndUserId(id, userId);

    if (!existing) {
      throw new AppError(404, "Flock not found");
    }

    await this.repository.delete(id, userId);
  }
}
