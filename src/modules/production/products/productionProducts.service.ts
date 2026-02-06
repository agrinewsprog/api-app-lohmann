import { AppError } from "../../../middlewares/errorHandler";
import { ProductionProductsRepository } from "./productionProducts.repository";
import {
  ProductResponse,
  StandardResponse,
  sanitizeProduct,
  sanitizeStandard,
} from "./productionProducts.types";

export class ProductionProductsService {
  private repository: ProductionProductsRepository;

  constructor() {
    this.repository = new ProductionProductsRepository();
  }

  async getAllProducts(): Promise<ProductResponse[]> {
    const products = await this.repository.findAll();
    return products.map(sanitizeProduct);
  }

  async getProductById(productId: number): Promise<ProductResponse> {
    const product = await this.repository.findById(productId);

    if (!product) {
      throw new AppError(404, "Product not found");
    }

    return sanitizeProduct(product);
  }

  async getProductStandards(
    productId: number,
    sex: "female" | "male" = "female"
  ): Promise<StandardResponse[]> {
    const product = await this.repository.findById(productId);

    if (!product) {
      throw new AppError(404, "Product not found");
    }

    const standards = await this.repository.findStandardsByProductId(
      productId,
      sex
    );

    if (!standards || standards.length === 0) {
      throw new AppError(404, "Standards not found for this product");
    }

    return standards.map(sanitizeStandard);
  }
}
