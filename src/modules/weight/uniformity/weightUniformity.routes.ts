import { Router } from 'express';
import { authenticateJWT } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import { weightUniformityController } from './weightUniformity.controller';
import {
  getUniformityValidation,
  getUniformityWeekValidation,
  getUniformityByUuidValidation,
  getUniformityLastValidation,
  getUniformityWeekByUuidValidation
} from './weightUniformity.validators';

const router = Router();

/**
 * GET /api/weight/uniformity
 * Get uniformity by flockId and productId for the authenticated user.
 * Query params: flockId (required int), productId (required string)
 */
router.get(
  '/',
  authenticateJWT,
  validate(getUniformityValidation),
  weightUniformityController.getUniformity
);

/**
 * GET /api/weight/uniformity/week
 * Get uniformity week setup for the authenticated user.
 * Query params: flockId (required int), productId (required string), week (required int)
 */
router.get(
  '/week',
  authenticateJWT,
  validate(getUniformityWeekValidation),
  weightUniformityController.getUniformityWeek
);

/**
 * GET /api/weight/uniformity/last
 * Get the last/default uniformityUuid for the authenticated user.
 * Optional query param: productId (string) - filter by product
 */
router.get(
  '/last',
  authenticateJWT,
  validate(getUniformityLastValidation),
  weightUniformityController.getLastUniformityUuid
);

/**
 * GET /api/weight/uniformity/:uniformityUuid/week
 * Get uniformity week setup by uniformityUuid for the authenticated user.
 * Path params: uniformityUuid (required string)
 * Query params: week (required int)
 */
router.get(
  '/:uniformityUuid/week',
  authenticateJWT,
  validate(getUniformityWeekByUuidValidation),
  weightUniformityController.getUniformityWeekByUuid
);

/**
 * GET /api/weight/uniformity/:uuid
 * Get uniformity by uuid for the authenticated user.
 * Path params: uuid (required string)
 */
router.get(
  '/:uuid',
  authenticateJWT,
  validate(getUniformityByUuidValidation),
  weightUniformityController.getUniformityByUuid
);

export default router;
