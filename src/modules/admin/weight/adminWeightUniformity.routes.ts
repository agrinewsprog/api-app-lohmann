import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../../../middlewares/auth";
import { validate } from "../../../middlewares/validate";
import { adminWeightUniformityController } from "./adminWeightUniformity.controller";
import {
  getHistoryValidation,
  getWeekValidation,
  saveWeekValidation,
} from "./adminWeightUniformity.validators";

const router = Router();

router.get(
  "/history",
  authenticateJWT,
  authorizeRoles("admin"),
  validate(getHistoryValidation),
  adminWeightUniformityController.getHistory,
);

router.get(
  "/week",
  authenticateJWT,
  authorizeRoles("admin"),
  validate(getWeekValidation),
  adminWeightUniformityController.getWeek,
);

router.post(
  "/week",
  authenticateJWT,
  authorizeRoles("admin"),
  validate(saveWeekValidation),
  adminWeightUniformityController.saveWeek,
);

export default router;
