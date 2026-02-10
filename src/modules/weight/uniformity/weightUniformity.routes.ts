import { Router } from 'express';
import { authenticateJWT } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import { weightUniformityController } from './weightUniformity.controller';
import {
  saveWeekValidation,
  getWeekValidation,
  getHistoryValidation,
} from './weightUniformity.validators';

const router = Router();

router.post(
  '/week',
  authenticateJWT,
  validate(saveWeekValidation),
  weightUniformityController.saveWeek,
);

router.get(
  '/week',
  authenticateJWT,
  validate(getWeekValidation),
  weightUniformityController.getWeek,
);

router.get(
  '/history',
  authenticateJWT,
  validate(getHistoryValidation),
  weightUniformityController.getHistory,
);

export default router;
