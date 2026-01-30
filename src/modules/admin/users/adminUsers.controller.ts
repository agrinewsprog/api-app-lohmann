import { Request, Response, NextFunction } from "express";
import { AdminUsersService } from "./adminUsers.service";

export class AdminUsersController {
  private service: AdminUsersService;

  constructor() {
    this.service = new AdminUsersService();
  }

  getAll = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = Math.min(
        parseInt(req.query.pageSize as string) || 20,
        100,
      );
      const search = req.query.search as string | undefined;
      const role = req.query.role as "admin" | "user" | undefined;

      const result = await this.service.getAllUsers(
        page,
        pageSize,
        search,
        role,
      );

      res.status(200).json({
        success: true,
        items: result.items,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const user = await this.service.getUserById(id);

      res.status(200).json({
        success: true,
        item: user,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { fullname, email, password, role } = req.body;
      const user = await this.service.createUser({
        fullname,
        email,
        password,
        role,
      });

      res.status(201).json({
        success: true,
        item: user,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const { fullname, email, role } = req.body;
      const user = await this.service.updateUser(id, { fullname, email, role });

      res.status(200).json({
        success: true,
        item: user,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const adminId = req.user!.id;
      await this.service.deleteUser(id, adminId);

      res.status(200).json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const { password } = req.body;
      const result = await this.service.resetPassword(id, password);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };
}
