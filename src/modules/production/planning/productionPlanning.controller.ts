import { Request, Response, NextFunction } from 'express';
import { ProductionPlanningService } from './productionPlanning.service';

export class ProductionPlanningController {
  private service: ProductionPlanningService;

  constructor() {
    this.service = new ProductionPlanningService();
  }

  execute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const flockId = parseInt(req.query.flockId as string, 10);

      const result = await this.service.executePlan(flockId, userId);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };
}
