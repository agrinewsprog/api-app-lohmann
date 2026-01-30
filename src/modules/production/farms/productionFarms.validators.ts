import { body, param } from 'express-validator';

export const createProductionFarmValidation = [
  body('name')
    .notEmpty()
    .withMessage('name is required')
    .isLength({ min: 2, max: 120 })
    .withMessage('name must be between 2 and 120 characters'),
];

export const updateProductionFarmValidation = [
  param('id')
    .notEmpty()
    .withMessage('id is required')
    .isInt({ min: 1 })
    .withMessage('id must be a positive integer')
    .toInt(),

  body('name')
    .optional()
    .isLength({ min: 2, max: 120 })
    .withMessage('name must be between 2 and 120 characters'),
];

export const idParamValidation = [
  param('id')
    .notEmpty()
    .withMessage('id is required')
    .isInt({ min: 1 })
    .withMessage('id must be a positive integer')
    .toInt(),
];
