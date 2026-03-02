import { Request, Response, NextFunction } from "express";
import { ProductionPlanningService } from "../../../modules/production/planning/productionPlanning.service";
import { AdminProductionFlocksRepository } from "./adminProductionFlocks.repository";

export class AdminProductionPlanningController {
  private service: ProductionPlanningService;
  private flocksRepo: AdminProductionFlocksRepository;

  constructor() {
    this.service = new ProductionPlanningService();
    this.flocksRepo = new AdminProductionFlocksRepository();
  }

  execute = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const flockId = parseInt(req.query.flockId as string, 10);

      // Get flock without user filter (admin access)
      const flock = await this.flocksRepo.findById(flockId);

      if (!flock) {
        res.status(404).json({
          success: false,
          error: { message: "Flock not found" },
        });
        return;
      }

      // Use the flock's actual user_id for the planning calculation
      const result = await this.service.executePlan(flockId, flock.user_id);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const adminProductionPlanningController =
  new AdminProductionPlanningController();
