import { Request, Response, NextFunction } from "express";
import { weightProductsService } from "./weightProducts.service";

class WeightProductsController {
  getProducts = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const products = await weightProductsService.getProductSummaries();
      res.json({ success: true, items: products });
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const productId = parseInt(req.params.productId, 10);
      const result = await weightProductsService.getProductById(productId);
      res.json({
        success: true,
        item: result.product,
        standards: result.standards,
      });
    } catch (error) {
      next(error);
    }
  };

  getStandardByWeek = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const productId = parseInt(req.params.productId, 10);
      const week = parseInt(req.query.week as string, 10);
      const sex = req.query.sex as "female" | "male";

      const standard = await weightProductsService.getStandardByWeek(
        productId,
        week,
        sex,
      );
      res.json({ success: true, item: standard });
    } catch (error) {
      next(error);
    }
  };
}

export const weightProductsController = new WeightProductsController();
