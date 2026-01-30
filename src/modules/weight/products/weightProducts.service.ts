import { AppError } from "../../../middlewares/errorHandler";
import { weightProductsLoader } from "./weightProducts.fixtureLoader";
import {
  ProductSummaryResponse,
  ProductDetailResponse,
  WeightStandard,
} from "./weightProducts.types";

/**
 * Service layer for weight products beta data provider.
 *
 * This service provides methods to retrieve product and standards data
 * from the in-memory fixture cache. The architecture is designed to be
 * easily replaceable with a database implementation later.
 */
class WeightProductsService {
  /**
   * Get all product summaries (without standards arrays).
   * For beta, returns the same dataset for any authenticated user.
   *
   * @param _userId - User ID from JWT (reserved for future user-scoped filtering)
   */
  getProductSummaries(): ProductSummaryResponse[] {
    const products = weightProductsLoader.getProductSummaries();

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      productgroup: product.productgroup,
      color: product.color,
      kindofattitude: product.kindofattitude,
      producttype: product.producttype,
    }));
  }

  /**
   * Get a product by ID with its full standards array.
   *
   * @param _userId - User ID from JWT (reserved for future user-scoped filtering)
   * @param productId - The product ID to retrieve
   * @throws AppError(404) if product not found
   */
  getProductById(productId: string): ProductDetailResponse {
    const result = weightProductsLoader.getProductById(productId);

    if (!result) {
      throw new AppError(404, `Product not found: ${productId}`);
    }

    return {
      product: result.product,
      standards: result.standards,
    };
  }

  /**
   * Get a specific standard row by productId and week.
   *
   * @param _userId - User ID from JWT (reserved for future user-scoped filtering)
   * @param productId - The product ID
   * @param week - The week number (0-indexed)
   * @throws AppError(404) if product or week not found
   */
  getStandardByWeek(
    // _userId: number,
    productId: string,
    week: number,
  ): WeightStandard {
    // First check if product exists
    if (!weightProductsLoader.hasProduct(productId)) {
      throw new AppError(404, `Product not found: ${productId}`);
    }

    const standard = weightProductsLoader.getStandardByWeek(productId, week);

    if (!standard) {
      throw new AppError(
        404,
        `Standard not found for week ${week} in product ${productId}`,
      );
    }

    return standard;
  }
}

export const weightProductsService = new WeightProductsService();
