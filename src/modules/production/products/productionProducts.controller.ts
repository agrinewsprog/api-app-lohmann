import { Request, Response, NextFunction } from "express";
import { ProductionProductsService } from "./productionProducts.service";

export class ProductionProductsController {
  private service: ProductionProductsService;

  constructor() {
    this.service = new ProductionProductsService();
  }

  getAll = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const products = await this.service.getAllProducts();

      res.status(200).json({
        success: true,
        items: products,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const productId = parseInt(req.params.productId, 10);
      const product = await this.service.getProductById(productId);

      res.status(200).json({
        success: true,
        item: product,
      });
    } catch (error) {
      next(error);
    }
  };

  getStandards = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const productId = parseInt(req.params.productId, 10);
      const sex = (req.query.sex as "female" | "male") || "female";
      const standards = await this.service.getProductStandards(productId, sex);

      res.status(200).json({
        success: true,
        items: standards,
      });
    } catch (error) {
      next(error);
    }
  };
}
