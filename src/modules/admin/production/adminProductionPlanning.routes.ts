import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../../../middlewares/auth";
import { validate } from "../../../middlewares/validate";
import { adminProductionPlanningController } from "./adminProductionPlanning.controller";
import { executePlanValidation } from "./adminProductionPlanning.validators";

const router = Router();

router.get(
  "/planning/execute",
  authenticateJWT,
  authorizeRoles("admin"),
  validate(executePlanValidation),
  adminProductionPlanningController.execute,
);

export default router;
