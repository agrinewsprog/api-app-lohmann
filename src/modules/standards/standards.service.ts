import { StandardsRepository } from './standards.repository';
import { StandardsImporter } from './standards.importer';
import { AppError } from '../../middlewares/errorHandler';
import {
  StandardsProductResponse,
  GrowthSingleResponse,
  GrowthCurveResponse,
  GrowthPoint,
  ImportSummary,
  sanitizeProduct
} from './standards.types';

export class StandardsService {
  private repository: StandardsRepository;
  private importer: StandardsImporter;

  constructor() {
    this.repository = new StandardsRepository();
    this.importer = new StandardsImporter();
  }

  async getAllProducts(): Promise<StandardsProductResponse[]> {
    const products = await this.repository.findAllProducts();
    return products.map(sanitizeProduct);
  }

  async getGrowthData(
    productId: number,
    week?: number,
    sex?: 'female' | 'male'
  ): Promise<GrowthSingleResponse | GrowthCurveResponse> {
    const product = await this.repository.findProductById(productId);

    if (!product) {
      throw new AppError(404, 'Product not found');
    }

    if (week !== undefined && sex) {
      const growth = await this.repository.findGrowthByProductAndWeekAndSex(productId, week, sex);

      if (!growth) {
        throw new AppError(404, 'Growth data not found for specified week and sex');
      }

      return {
        productId: growth.product_id,
        week: growth.week,
        sex: growth.sex,
        min: growth.min_value,
        avg: growth.avg_value,
        max: growth.max_value
      };
    }

    if (sex) {
      const growthData = await this.repository.findGrowthByProductAndSex(productId, sex);

      const points: GrowthPoint[] = growthData.map(g => ({
        week: g.week,
        min: g.min_value,
        avg: g.avg_value,
        max: g.max_value
      }));

      const response: GrowthCurveResponse = {
        productId: product.id,
        breed: product.breed,
        color: product.color,
        female: sex === 'female' ? points : [],
        male: sex === 'male' ? points : []
      };

      return response;
    }

    const allGrowthData = await this.repository.findGrowthByProduct(productId);

    const femalePoints: GrowthPoint[] = [];
    const malePoints: GrowthPoint[] = [];

    for (const g of allGrowthData) {
      const point: GrowthPoint = {
        week: g.week,
        min: g.min_value,
        avg: g.avg_value,
        max: g.max_value
      };

      if (g.sex === 'female') {
        femalePoints.push(point);
      } else {
        malePoints.push(point);
      }
    }

    return {
      productId: product.id,
      breed: product.breed,
      color: product.color,
      female: femalePoints,
      male: malePoints
    };
  }

  async importGrowthStandards(csvPath: string): Promise<ImportSummary> {
    return this.importer.importFromCSV(csvPath);
  }

  async clearAllData(): Promise<{ productsDeleted: number; growthDeleted: number }> {
    return this.repository.deleteAllGrowthData();
  }
}
