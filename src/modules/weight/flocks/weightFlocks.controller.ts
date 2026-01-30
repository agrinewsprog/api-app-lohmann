import { Request, Response, NextFunction } from 'express';
import { WeightFlocksService } from './weightFlocks.service';

export class WeightFlocksController {
  private service: WeightFlocksService;

  constructor() {
    this.service = new WeightFlocksService();
  }

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const flocks = await this.service.getAllFlocks(userId);

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
      const { name, location, notes } = req.body;
      const flock = await this.service.createFlock(userId, { name, location, notes });

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
      const { name, location, notes } = req.body;
      const flock = await this.service.updateFlock(id, userId, { name, location, notes });

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
