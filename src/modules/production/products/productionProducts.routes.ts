import { Router } from "express";
import { ProductionProductsController } from "./productionProducts.controller";
import { validate } from "../../../middlewares/validate";
import { authenticateJWT } from "../../../middlewares/auth";
import {
  productIdParamValidation,
  getStandardsValidation,
} from "./productionProducts.validators";

const router = Router();
const controller = new ProductionProductsController();

router.get("/", authenticateJWT, controller.getAll);

router.get(
  "/:productId",
  authenticateJWT,
  validate(productIdParamValidation),
  controller.getById
);

router.get(
  "/:productId/standards",
  authenticateJWT,
  validate(getStandardsValidation),
  controller.getStandards
);

export default router;
