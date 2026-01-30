import { Request, Response, NextFunction } from "express";
import { weightProductsService } from "./weightProducts.service";

/**
 * Controller for weight products beta data provider endpoints.
 */
class WeightProductsController {
  /**
   * GET /api/weight/products
   * Returns all product summaries (without standards arrays).
   */
  getProducts = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // const userId = req.user!.id;
      const products = weightProductsService.getProductSummaries();

      res.json({
        success: true,
        items: products,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/weight/products/:productId
   * Returns a product with its full standards array.
   */
  getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // const userId = req.user!.id;
      const { productId } = req.params;
      const result = weightProductsService.getProductById(productId);

      res.json({
        success: true,
        product: result.product,
        standards: result.standards,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/weight/products/:productId/standards
   * Returns a single standard row for the specified week.
   */
  getStandardByWeek = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // const userId = req.user!.id;
      const { productId } = req.params;
      const week = parseInt(req.query.week as string, 10);
      const standard = weightProductsService.getStandardByWeek(
        // userId,
        productId,
        week,
      );

      res.json({
        success: true,
        item: standard,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const weightProductsController = new WeightProductsController();
