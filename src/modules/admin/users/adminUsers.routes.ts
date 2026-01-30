import { Router } from 'express';
import { AdminUsersController } from './adminUsers.controller';
import { authenticateJWT, authorizeRoles } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import {
  listUsersValidation,
  getUserByIdValidation,
  createUserValidation,
  updateUserValidation,
  deleteUserValidation,
  resetPasswordValidation,
} from './adminUsers.validators';

const router = Router();
const controller = new AdminUsersController();

router.get(
  '/',
  authenticateJWT,
  authorizeRoles('admin'),
  validate(listUsersValidation),
  controller.getAll
);

router.get(
  '/:id',
  authenticateJWT,
  authorizeRoles('admin'),
  validate(getUserByIdValidation),
  controller.getById
);

router.post(
  '/',
  authenticateJWT,
  authorizeRoles('admin'),
  validate(createUserValidation),
  controller.create
);

router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('admin'),
  validate(updateUserValidation),
  controller.update
);

router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('admin'),
  validate(deleteUserValidation),
  controller.delete
);

router.post(
  '/:id/reset-password',
  authenticateJWT,
  authorizeRoles('admin'),
  validate(resetPasswordValidation),
  controller.resetPassword
);

export default router;
