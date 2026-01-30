import { body, param, query } from "express-validator";

export const getStandardWeeksByProductValidation = [
  query("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isInt({ min: 1 })
    .withMessage("Product ID must be a positive integer")
    .toInt(),
];

export const createStandardWeekValidation = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isInt({ min: 1 })
    .withMessage("Product ID must be a positive integer")
    .toInt(),

  body("week")
    .notEmpty()
    .withMessage("Week is required")
    .isInt({ min: 0 })
    .withMessage("Week must be a non-negative integer")
    .toInt(),

  body("sex")
    .notEmpty()
    .withMessage("Sex is required")
    .isIn(["female", "male"])
    .withMessage("Sex must be either female or male"),

  body("min")
    .notEmpty()
    .withMessage("Min value is required")
    .isFloat({ min: 0 })
    .withMessage("Min value must be a non-negative number")
    .toFloat(),

  body("avg")
    .notEmpty()
    .withMessage("Avg value is required")
    .isFloat({ min: 0 })
    .withMessage("Avg value must be a non-negative number")
    .toFloat(),

  body("max")
    .notEmpty()
    .withMessage("Max value is required")
    .isFloat({ min: 0 })
    .withMessage("Max value must be a non-negative number")
    .toFloat(),

  body().custom((value) => {
    if (value.min > value.avg || value.avg > value.max) {
      throw new Error("Values must satisfy: min <= avg <= max");
    }
    return true;
  }),
];

export const updateStandardWeekValidation = [
  param("id")
    .notEmpty()
    .withMessage("ID is required")
    .isInt({ min: 1 })
    .withMessage("ID must be a positive integer")
    .toInt(),

  body("min")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Min value must be a non-negative number")
    .toFloat(),

  body("avg")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Avg value must be a non-negative number")
    .toFloat(),

  body("max")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Max value must be a non-negative number")
    .toFloat(),

  body().custom((value) => {
    const hasUpdate =
      value.min !== undefined ||
      value.avg !== undefined ||
      value.max !== undefined;
    if (!hasUpdate) {
      throw new Error("At least one field (min, avg, max) must be provided");
    }
    return true;
  }),
];

export const getStandardWeekValidation = [
  param("id")
    .notEmpty()
    .withMessage("ID is required")
    .isInt({ min: 1 })
    .withMessage("ID must be a positive integer")
    .toInt(),
];

export const deleteStandardWeekValidation = [
  param("id")
    .notEmpty()
    .withMessage("ID is required")
    .isInt({ min: 1 })
    .withMessage("ID must be a positive integer")
    .toInt(),
];
