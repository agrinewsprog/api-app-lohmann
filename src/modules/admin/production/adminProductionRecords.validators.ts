import { param } from "express-validator";

export const getByFlockValidation = [
  param("flockId")
    .isInt({ min: 1 })
    .withMessage("flockId must be a positive integer"),
];
