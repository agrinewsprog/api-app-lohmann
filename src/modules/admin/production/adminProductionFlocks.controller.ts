import { Request, Response, NextFunction } from 'express';
import { AdminProductionFlocksService } from './adminProductionFlocks.service';

export class AdminProductionFlocksController {
  private service: AdminProductionFlocksService;

  constructor() {
    this.service = new AdminProductionFlocksService();
  }

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 100);
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const search = req.query.search as string | undefined;

      const result = await this.service.getAllFlocks(page, pageSize, userId, search);

      res.status(200).json({
        success: true,
        items: result.items,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const flock = await this.service.getFlockById(id);

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
      const { userId, name, location, notes } = req.body;
      const flock = await this.service.createFlock({ userId, name, location, notes });

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
      const id = parseInt(req.params.id, 10);
      const { name, location, notes } = req.body;
      const flock = await this.service.updateFlock(id, { name, location, notes });

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
      const id = parseInt(req.params.id, 10);
      await this.service.deleteFlock(id);

      res.status(200).json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  };
}
