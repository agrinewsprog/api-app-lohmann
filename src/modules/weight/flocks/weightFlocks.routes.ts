import { Router } from 'express';
import { WeightFlocksController } from './weightFlocks.controller';
import { validate } from '../../../middlewares/validate';
import { authenticateJWT } from '../../../middlewares/auth';
import {
  createWeightFlockValidation,
  updateWeightFlockValidation,
  idParamValidation,
} from './weightFlocks.validators';

const router = Router();
const controller = new WeightFlocksController();

router.get('/', authenticateJWT, controller.getAll);

router.get('/:id', authenticateJWT, validate(idParamValidation), controller.getById);

router.post('/', authenticateJWT, validate(createWeightFlockValidation), controller.create);

router.put('/:id', authenticateJWT, validate(updateWeightFlockValidation), controller.update);

router.delete('/:id', authenticateJWT, validate(idParamValidation), controller.delete);

export default router;
