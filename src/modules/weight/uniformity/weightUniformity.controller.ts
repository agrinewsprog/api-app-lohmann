import { Request, Response, NextFunction } from "express";
import { weightUniformityService } from "./weightUniformity.service";

/**
 * Controller for weight uniformity endpoints.
 * All endpoints require authentication and enforce user ownership.
 */
class WeightUniformityController {
  /**
   * GET /api/weight/uniformity
   * Get uniformity by flockId and productId for the authenticated user.
   */
  getUniformity = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const flockId = parseInt(req.query.flockId as string, 10);
      const productId = req.query.productId as string;

      const result = weightUniformityService.getUniformity(
        userId,
        flockId,
        productId,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/weight/uniformity/week
   * Get uniformity week setup for the authenticated user.
   */
  getUniformityWeek = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // flockId: 684;
      // measureUnit: "g";
      // productId: "31353938-3333-3636-3631-353236343735";
      // userId: "33393530-3337-3238-3638-393137393831";
      // uuid: "PPOqoU99-5mmDxRXe-qhfe8Nmx-FQmKf1DT";
      // const userId = req.user!.id;
      const userId = "33393530-3337-3238-3638-393137393831";
      // const flockId = parseInt(req.query.flockId as string, 10);
      const flockId = 684;

      // const productId = req.query.productId as string;
      const productId = "31303936-3431-3235-3036-333036323038";
      const week = parseInt(req.query.week as string, 10);

      const result = weightUniformityService.getUniformityWeek(
        userId,
        flockId,
        productId,
        week,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/weight/uniformity/:uuid
   * Get uniformity by uuid for the authenticated user.
   */
  getUniformityByUuid = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const uuid = req.params.uuid;

      const result = weightUniformityService.getUniformityByUuid(userId, uuid);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/weight/uniformity/last
   * Get the last/default uniformityUuid for the authenticated user.
   */
  getLastUniformityUuid = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // const userId = req.user!.id;
      // const productId = req.query.productId as string | undefined;
      const userId = "33393530-3337-3238-3638-393137393831";
      const productId = "31303936-3431-3235-3036-333036323038";

      const result = weightUniformityService.getLastUniformityUuid(
        userId,
        productId,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/weight/uniformity/:uniformityUuid/week
   * Get uniformity week setup by uniformityUuid for the authenticated user.
   */
  getUniformityWeekByUuid = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = "33393530-3337-3238-3638-393137393831";
      // const productId = "31303936-3431-3235-3036-333036323038";
      // const userId = req.user!.id;
      // const uniformityUuid = req.params.uniformityUuid;
      const uniformityUuid = "5CNHWKOS-kQ99c4rs-dAi5MIcW-xlCmfp9C";
      const week = parseInt(req.query.week as string, 10);

      const result = weightUniformityService.getUniformityWeekByUuid(
        userId,
        uniformityUuid,
        week,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const weightUniformityController = new WeightUniformityController();
