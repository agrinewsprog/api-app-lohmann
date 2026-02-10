import { param, query, ValidationChain } from 'express-validator';

export const getProductByIdValidation: ValidationChain[] = [
  param('productId')
    .notEmpty()
    .withMessage('productId is required')
    .isInt({ min: 1 })
    .withMessage('productId must be a positive integer')
    .toInt(),
];

export const getStandardByWeekValidation: ValidationChain[] = [
  param('productId')
    .notEmpty()
    .withMessage('productId is required')
    .isInt({ min: 1 })
    .withMessage('productId must be a positive integer')
    .toInt(),
  query('week')
    .notEmpty()
    .withMessage('week query parameter is required')
    .isInt({ min: 0 })
    .withMessage('week must be an integer >= 0')
    .toInt(),
  query('sex')
    .notEmpty()
    .withMessage('sex query parameter is required')
    .isIn(['female', 'male'])
    .withMessage('sex must be "female" or "male"'),
];
