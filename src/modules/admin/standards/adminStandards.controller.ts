import { Request, Response, NextFunction } from "express";
import { AdminStandardsService } from "./adminStandards.service";
import {
  CreateStandardWeekDTO,
  UpdateStandardWeekDTO,
} from "./adminStandards.types";

export class AdminStandardsController {
  private service: AdminStandardsService;

  constructor() {
    this.service = new AdminStandardsService();
  }

  getWeek = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const result = await this.service.getStandardWeek(id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getWeeksByProduct = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const productId = parseInt(req.query.productId as string);
      const result = await this.service.getStandardWeeksByProduct(productId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  createWeek = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto: CreateStandardWeekDTO = req.body;
      const result = await this.service.createStandardWeek(dto);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateWeek = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const dto: UpdateStandardWeekDTO = req.body;

      const result = await this.service.updateStandardWeek(id, dto);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteWeek = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      await this.service.deleteStandardWeek(id);

      res.status(200).json({
        success: true,
        message: "Standard week deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
