import { Request, Response, NextFunction } from "express";
import { AdminProductionRecordsService } from "./adminProductionRecords.service";

const service = new AdminProductionRecordsService();

class AdminProductionRecordsController {
  getByFlock = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const flockId = parseInt(req.params.flockId, 10);

      const result = await service.getByFlock(flockId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const adminProductionRecordsController =
  new AdminProductionRecordsController();
