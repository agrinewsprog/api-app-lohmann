import { Router } from 'express';
import { authenticateJWT } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import { weightProductsController } from './weightProducts.controller';
import {
  getProductByIdValidation,
  getStandardByWeekValidation,
} from './weightProducts.validators';

const router = Router();

router.get(
  '/',
  authenticateJWT,
  weightProductsController.getProducts,
);

router.get(
  '/:productId',
  authenticateJWT,
  validate(getProductByIdValidation),
  weightProductsController.getProductById,
);

router.get(
  '/:productId/standards',
  authenticateJWT,
  validate(getStandardByWeekValidation),
  weightProductsController.getStandardByWeek,
);

export default router;
