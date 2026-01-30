import { Router } from "express";
import { StandardsController } from "./standards.controller";
import { validate } from "../../middlewares/validate";
import { authenticateJWT, authorizeRoles } from "../../middlewares/auth";
import { getGrowthValidation } from "./standards.validators";

const router = Router();
const standardsController = new StandardsController();

router.get("/products", standardsController.getProducts);

router.get(
  "/growth",
  validate(getGrowthValidation),
  standardsController.getGrowth,
);

router.post(
  "/import/growth",
  authenticateJWT,
  authorizeRoles("admin"),
  standardsController.importGrowth,
);

router.delete(
  "/clear",
  authenticateJWT,
  authorizeRoles("admin"),
  standardsController.clearGrowth,
);

export default router;
