import { query, body } from "express-validator";

export const getHistoryValidation = [
  query("flockId")
    .isInt({ min: 1 })
    .withMessage("flockId must be a positive integer"),
  query("sex")
    .optional()
    .isIn(["female", "male"])
    .withMessage('sex must be either "female" or "male"'),
];

export const getWeekValidation = [
  query("flockId")
    .isInt({ min: 1 })
    .withMessage("flockId must be a positive integer"),
  query("week")
    .isInt({ min: 1 })
    .withMessage("week must be a positive integer"),
  query("sex")
    .isIn(["female", "male"])
    .withMessage('sex must be either "female" or "male"'),
];

export const saveWeekValidation = [
  body("flockId")
    .isInt({ min: 1 })
    .withMessage("flockId must be a positive integer"),
  body("week")
    .isInt({ min: 0 })
    .withMessage("week must be a non-negative integer"),
  body("sex")
    .isIn(["female", "male"])
    .withMessage('sex must be either "female" or "male"'),
  body("weights")
    .isArray({ min: 2 })
    .withMessage("weights must be an array with at least 2 values"),
  body("weights.*")
    .isFloat({ min: 1 })
    .withMessage("each weight must be a positive number"),
];
