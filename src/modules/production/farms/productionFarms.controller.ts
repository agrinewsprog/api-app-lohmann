import { Request, Response, NextFunction } from 'express';
import { ProductionFarmsService } from './productionFarms.service';

export class ProductionFarmsController {
  private service: ProductionFarmsService;

  constructor() {
    this.service = new ProductionFarmsService();
  }

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const farms = await this.service.getAllFarms(userId);

      res.status(200).json({
        success: true,
        items: farms,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const id = parseInt(req.params.id, 10);
      const farm = await this.service.getFarmById(id, userId);

      res.status(200).json({
        success: true,
        item: farm,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { name } = req.body;
      const farm = await this.service.createFarm(userId, { name });

      res.status(201).json({
        success: true,
        item: farm,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const id = parseInt(req.params.id, 10);
      const { name } = req.body;
      const farm = await this.service.updateFarm(id, userId, { name });

      res.status(200).json({
        success: true,
        item: farm,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const id = parseInt(req.params.id, 10);
      await this.service.deleteFarm(id, userId);

      res.status(200).json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  };
}
