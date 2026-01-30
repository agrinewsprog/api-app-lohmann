import { Router } from 'express';
import { ProductionProductsController } from './productionProducts.controller';
import { validate } from '../../../middlewares/validate';
import { authenticateJWT } from '../../../middlewares/auth';
import {
  productIdParamValidation,
  listProductsQueryValidation,
} from './productionProducts.validators';

const router = Router();
const controller = new ProductionProductsController();

router.get('/', authenticateJWT, validate(listProductsQueryValidation), controller.getAll);

router.get('/:productId', authenticateJWT, validate(productIdParamValidation), controller.getById);

router.get('/:productId/standards', authenticateJWT, validate(productIdParamValidation), controller.getStandards);

export default router;
