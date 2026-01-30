import { Router } from "express";
import { AdminStandardsController } from "./adminStandards.controller";
import { authenticateJWT, authorizeRoles } from "../../../middlewares/auth";
import { validate } from "../../../middlewares/validate";
import {
  getStandardWeeksByProductValidation,
  getStandardWeekValidation,
  createStandardWeekValidation,
  updateStandardWeekValidation,
  deleteStandardWeekValidation,
} from "./adminStandards.validators";

const router = Router();
const controller = new AdminStandardsController();

// All routes require authentication and admin role
router.use(authenticateJWT, authorizeRoles("admin"));

// GET /api/admin/standards/weeks?productId=X - Get all weeks for a product
router.get(
  "/weeks",
  validate(getStandardWeeksByProductValidation),
  controller.getWeeksByProduct,
);

// GET /api/admin/standards/weeks/:id - Get a week by ID
router.get(
  "/weeks/:id",
  validate(getStandardWeekValidation),
  controller.getWeek,
);

// POST /api/admin/standards/weeks - Create a new week
router.post(
  "/weeks",
  validate(createStandardWeekValidation),
  controller.createWeek,
);

// PATCH /api/admin/standards/weeks/:id - Update a week
router.patch(
  "/weeks/:id",
  validate(updateStandardWeekValidation),
  controller.updateWeek,
);

// DELETE /api/admin/standards/weeks/:id - Delete a week
router.delete(
  "/weeks/:id",
  validate(deleteStandardWeekValidation),
  controller.deleteWeek,
);

export default router;
