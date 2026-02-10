import { StandardsRepository } from '../../standards/standards.repository';
import { AppError } from '../../../middlewares/errorHandler';
import {
  WeightProductResponse,
  WeightGrowthStandard,
  ProductDetailResponse,
} from './weightProducts.types';

class WeightProductsService {
  private repository: StandardsRepository;

  constructor() {
    this.repository = new StandardsRepository();
  }

  async getProductSummaries(): Promise<WeightProductResponse[]> {
    const products = await this.repository.findAllProducts();
    return products.map((p) => ({
      id: p.id,
      breed: p.breed,
      color: p.color,
      image: p.image,
    }));
  }

  async getProductById(productId: number): Promise<ProductDetailResponse> {
    const product = await this.repository.findProductById(productId);
    if (!product) {
      throw new AppError(404, 'Product not found');
    }

    const growthRows = await this.repository.findGrowthByProduct(productId);

    const standards: WeightGrowthStandard[] = growthRows.map((row) => ({
      week: row.week,
      sex: row.sex,
      min_value: Number(row.min_value),
      avg_value: Number(row.avg_value),
      max_value: Number(row.max_value),
    }));

    return {
      product: {
        id: product.id,
        breed: product.breed,
        color: product.color,
        image: product.image,
      },
      standards,
    };
  }

  async getStandardByWeek(
    productId: number,
    week: number,
    sex: 'female' | 'male',
  ): Promise<WeightGrowthStandard> {
    const product = await this.repository.findProductById(productId);
    if (!product) {
      throw new AppError(404, 'Product not found');
    }

    const growth = await this.repository.findGrowthByProductAndWeekAndSex(productId, week, sex);
    if (!growth) {
      throw new AppError(404, `Standard not found for week ${week}, sex ${sex}`);
    }

    return {
      week: growth.week,
      sex: growth.sex,
      min_value: Number(growth.min_value),
      avg_value: Number(growth.avg_value),
      max_value: Number(growth.max_value),
    };
  }
}

export const weightProductsService = new WeightProductsService();
