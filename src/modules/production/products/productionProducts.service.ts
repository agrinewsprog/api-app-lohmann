import { AppError } from '../../../middlewares/errorHandler';
import {
  ProductResponse,
  StandardResponse,
  sanitizeProduct,
  sanitizeStandard,
} from './productionProducts.types';
import {
  loadProducts,
  getProductById,
  getStandardsByProductId,
} from './productionProducts.loader';

export interface ListProductsFilters {
  group?: string;
  client?: string;
  color?: string;
}

export class ProductionProductsService {
  async getAllProducts(filters: ListProductsFilters = {}): Promise<ProductResponse[]> {
    let products = loadProducts();

    if (filters.group) {
      products = products.filter(p => p.productgroup === filters.group);
    }
    if (filters.client) {
      products = products.filter(p => p.client === filters.client);
    }
    if (filters.color) {
      products = products.filter(p => p.color === filters.color);
    }

    return products.map(sanitizeProduct);
  }

  async getProductById(productId: string): Promise<ProductResponse> {
    const product = getProductById(productId);

    if (!product) {
      throw new AppError(404, 'Product not found');
    }

    return sanitizeProduct(product);
  }

  async getProductStandards(productId: string): Promise<StandardResponse[]> {
    const product = getProductById(productId);

    if (!product) {
      throw new AppError(404, 'Product not found');
    }

    const standards = getStandardsByProductId(productId);

    if (!standards) {
      throw new AppError(404, 'Standards not found for this product');
    }

    return standards.map(sanitizeStandard);
  }
}
