import { Request, Response, NextFunction } from 'express';
import { WeightUniformityService } from './weightUniformity.service';

const service = new WeightUniformityService();

class WeightUniformityController {
  saveWeek = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { flockId, week, sex, weights } = req.body;

      const result = await service.saveWeek(userId, { flockId, week, sex, weights });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getWeek = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const flockId = parseInt(req.query.flockId as string, 10);
      const week = parseInt(req.query.week as string, 10);
      const sex = req.query.sex as 'female' | 'male';

      const result = await service.getWeek(userId, flockId, week, sex);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const flockId = parseInt(req.query.flockId as string, 10);
      const sex = req.query.sex as 'female' | 'male' | undefined;

      const result = await service.getHistory(userId, flockId, sex);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const weightUniformityController = new WeightUniformityController();
