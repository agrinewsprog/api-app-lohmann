import { param, query } from "express-validator";

export const productIdParamValidation = [
  param("productId")
    .notEmpty()
    .withMessage("productId is required")
    .isInt({ min: 1 })
    .withMessage("productId must be a positive integer")
    .toInt(),
];

export const getStandardsValidation = [
  param("productId")
    .notEmpty()
    .withMessage("productId is required")
    .isInt({ min: 1 })
    .withMessage("productId must be a positive integer")
    .toInt(),
  query("sex")
    .optional()
    .isIn(["female", "male"])
    .withMessage("sex must be either 'female' or 'male'"),
];
