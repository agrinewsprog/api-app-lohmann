import { Router } from "express";
import { validate } from "../../../middlewares/validate";
// import { authenticateJWT } from "../../../middlewares/auth";
import { weightProductsController } from "./weightProducts.controller";
import {
  getProductByIdValidation,
  getStandardByWeekValidation,
} from "./weightProducts.validators";

const router = Router();

/**
 * Weight Products Beta Data Provider Routes
 *
 * All routes require JWT authentication.
 *
 * GET /api/weight/products
 *   - Returns list of product summaries
 *
 * GET /api/weight/products/:productId
 *   - Returns product with full standards array
 *
 * GET /api/weight/products/:productId/standards?week=N
 *   - Returns single standard row for specified week
 */

// GET /api/weight/products - List all products
router.get(
  "/",
  // authenticateJWT,
  weightProductsController.getProducts,
);

// GET /api/weight/products/:productId - Get product with standards
router.get(
  "/:productId",
  // authenticateJWT,
  validate(getProductByIdValidation),
  weightProductsController.getProductById,
);

// GET /api/weight/products/:productId/standards - Get standard by week
router.get(
  "/:productId/standards",
  // authenticateJWT,
  validate(getStandardByWeekValidation),
  weightProductsController.getStandardByWeek,
);

export default router;
