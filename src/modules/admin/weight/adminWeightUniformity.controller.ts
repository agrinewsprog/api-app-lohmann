import { Request, Response, NextFunction } from "express";
import { AdminWeightUniformityService } from "./adminWeightUniformity.service";

const service = new AdminWeightUniformityService();

class AdminWeightUniformityController {
  getHistory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const flockId = parseInt(req.query.flockId as string, 10);
      const sex = req.query.sex as "female" | "male" | undefined;

      const result = await service.getHistory(flockId, sex);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getWeek = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const flockId = parseInt(req.query.flockId as string, 10);
      const week = parseInt(req.query.week as string, 10);
      const sex = req.query.sex as "female" | "male";

      const result = await service.getWeek(flockId, week, sex);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  saveWeek = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { flockId, week, sex, weights } = req.body;

      const result = await service.saveWeek(
        parseInt(flockId, 10),
        parseInt(week, 10),
        sex as "female" | "male",
        weights as number[],
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const adminWeightUniformityController =
  new AdminWeightUniformityController();
