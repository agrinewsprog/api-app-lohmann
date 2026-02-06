import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  LogoutRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "./auth.types";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data: RegisterRequest = req.body;
      const result = await this.authService.register(data);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data: LoginRequest = req.body;
      const result = await this.authService.login(data);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { refreshToken }: RefreshTokenRequest = req.body;
      const result = await this.authService.refresh(refreshToken);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { refreshToken }: LogoutRequest = req.body;
      await this.authService.logout(refreshToken);

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getMe = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const user = await this.authService.getMe(req.user.id);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const data: UpdateProfileRequest = req.body;
      const user = await this.authService.updateProfile(req.user.id, data);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const data: ChangePasswordRequest = req.body;
      await this.authService.changePassword(req.user.id, data);

      res.status(200).json({
        success: true,
        message:
          "Password changed successfully. Please log in again on all devices.",
      });
    } catch (error) {
      next(error);
    }
  };
}
