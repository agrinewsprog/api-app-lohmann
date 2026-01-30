import { Router } from 'express';
import { AdminWeightFlocksController } from './adminWeightFlocks.controller';
import { authenticateJWT, authorizeRoles } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import {
  listFlocksValidation,
  getFlockByIdValidation,
  createFlockValidation,
  updateFlockValidation,
  deleteFlockValidation,
} from './adminWeightFlocks.validators';

const router = Router();
const controller = new AdminWeightFlocksController();

router.get(
  '/',
  authenticateJWT,
  authorizeRoles('admin'),
  validate(listFlocksValidation),
  controller.getAll
);

router.get(
  '/:id',
  authenticateJWT,
  authorizeRoles('admin'),
  validate(getFlockByIdValidation),
  controller.getById
);

router.post(
  '/',
  authenticateJWT,
  authorizeRoles('admin'),
  validate(createFlockValidation),
  controller.create
);

router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('admin'),
  validate(updateFlockValidation),
  controller.update
);

router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('admin'),
  validate(deleteFlockValidation),
  controller.delete
);

export default router;
