import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../../../middlewares/auth";
import { validate } from "../../../middlewares/validate";
import { adminProductionRecordsController } from "./adminProductionRecords.controller";
import { getByFlockValidation } from "./adminProductionRecords.validators";

const router = Router();

router.get(
  "/flocks/:flockId/records",
  authenticateJWT,
  authorizeRoles("admin"),
  validate(getByFlockValidation),
  adminProductionRecordsController.getByFlock,
);

export default router;
