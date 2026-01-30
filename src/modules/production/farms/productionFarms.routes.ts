import { Router } from 'express';
import { ProductionFarmsController } from './productionFarms.controller';
import { validate } from '../../../middlewares/validate';
import { authenticateJWT } from '../../../middlewares/auth';
import {
  createProductionFarmValidation,
  updateProductionFarmValidation,
  idParamValidation,
} from './productionFarms.validators';

const router = Router();
const controller = new ProductionFarmsController();

router.get('/', authenticateJWT, controller.getAll);

router.get('/:id', authenticateJWT, validate(idParamValidation), controller.getById);

router.post('/', authenticateJWT, validate(createProductionFarmValidation), controller.create);

router.put('/:id', authenticateJWT, validate(updateProductionFarmValidation), controller.update);

router.delete('/:id', authenticateJWT, validate(idParamValidation), controller.delete);

export default router;
