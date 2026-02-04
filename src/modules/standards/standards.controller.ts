import { Request, Response, NextFunction } from "express";
import { StandardsService } from "./standards.service";
import { AppError } from "../../middlewares/errorHandler";

export class StandardsController {
  private standardsService: StandardsService;

  constructor() {
    this.standardsService = new StandardsService();
  }

  getProducts = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const products = await this.standardsService.getAllProducts();

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };

  getGrowth = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const productId = parseInt(req.query.productId as string, 10);
      const week = req.query.week
        ? parseInt(req.query.week as string, 10)
        : undefined;
      const sex = req.query.sex as "female" | "male" | undefined;

      const result = await this.standardsService.getGrowthData(
        productId,
        week,
        sex,
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  importGrowth = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const csvPath =
        "/Users/alexdesign/Desktop/lohmann-app/api/PS-Standards-2025-FINAL-05.08.csv"; // Ideally, this should come from a config or environment variable

      if (!csvPath) {
        throw new AppError(
          500,
          "STANDARDS_CSV_PATH environment variable not configured",
        );
      }

      const summary =
        await this.standardsService.importGrowthStandards(csvPath);

      res.status(200).json({
        success: true,
        message: "Standards imported successfully",
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  };

  clearGrowth = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.standardsService.clearAllData();

      res.status(200).json({
        success: true,
        message: "All standards data cleared successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getProductionStandards = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const productId = parseInt(req.params.id, 10);

      if (isNaN(productId)) {
        res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
        return;
      }

      const result = await this.standardsService.getProductionStandards(productId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
