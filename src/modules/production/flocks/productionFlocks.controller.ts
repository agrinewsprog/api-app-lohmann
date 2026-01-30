import { Request, Response, NextFunction } from 'express';
import { ProductionFlocksService } from './productionFlocks.service';

export class ProductionFlocksController {
  private service: ProductionFlocksService;

  constructor() {
    this.service = new ProductionFlocksService();
  }

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const farmId = req.query.farmId ? parseInt(req.query.farmId as string, 10) : undefined;
      const flocks = await this.service.getAllFlocks(userId, farmId);

      res.status(200).json({
        success: true,
        items: flocks,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const id = parseInt(req.params.id, 10);
      const flock = await this.service.getFlockById(id, userId);

      res.status(200).json({
        success: true,
        item: flock,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const {
        farmId, name, flockNumber, hatchDate,
        hensHoused, productionPeriod, productId,
        location, notes
      } = req.body;

      const flock = await this.service.createFlock(userId, {
        farmId, name, flockNumber, hatchDate,
        hensHoused, productionPeriod, productId,
        location, notes
      });

      res.status(201).json({
        success: true,
        item: flock,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const id = parseInt(req.params.id, 10);
      const {
        farmId, name, flockNumber, hatchDate,
        hensHoused, productionPeriod, productId,
        location, notes
      } = req.body;

      const flock = await this.service.updateFlock(id, userId, {
        farmId, name, flockNumber, hatchDate,
        hensHoused, productionPeriod, productId,
        location, notes
      });

      res.status(200).json({
        success: true,
        item: flock,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const id = parseInt(req.params.id, 10);
      await this.service.deleteFlock(id, userId);

      res.status(200).json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  };
}
