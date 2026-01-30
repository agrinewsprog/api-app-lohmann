import { Router } from 'express';
import { ProductionFlocksController } from './productionFlocks.controller';
import { validate } from '../../../middlewares/validate';
import { authenticateJWT } from '../../../middlewares/auth';
import {
  createProductionFlockValidation,
  updateProductionFlockValidation,
  idParamValidation,
  listFlocksQueryValidation,
} from './productionFlocks.validators';

const router = Router();
const controller = new ProductionFlocksController();

router.get('/', authenticateJWT, validate(listFlocksQueryValidation), controller.getAll);

router.get('/:id', authenticateJWT, validate(idParamValidation), controller.getById);

router.post('/', authenticateJWT, validate(createProductionFlockValidation), controller.create);

router.put('/:id', authenticateJWT, validate(updateProductionFlockValidation), controller.update);

router.delete('/:id', authenticateJWT, validate(idParamValidation), controller.delete);

export default router;
