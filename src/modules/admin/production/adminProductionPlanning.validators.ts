import { query } from "express-validator";

export const executePlanValidation = [
  query("flockId")
    .isInt({ min: 1 })
    .withMessage("flockId must be a positive integer"),
];
