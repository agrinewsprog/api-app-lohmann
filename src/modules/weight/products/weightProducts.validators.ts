import { param, query, ValidationChain } from 'express-validator';

/**
 * Validation for GET /api/weight/products/:productId
 */
export const getProductByIdValidation: ValidationChain[] = [
  param('productId')
    .notEmpty()
    .withMessage('productId is required')
    .isString()
    .withMessage('productId must be a string')
    .trim()
];

/**
 * Validation for GET /api/weight/products/:productId/standards
 */
export const getStandardByWeekValidation: ValidationChain[] = [
  param('productId')
    .notEmpty()
    .withMessage('productId is required')
    .isString()
    .withMessage('productId must be a string')
    .trim(),
  query('week')
    .notEmpty()
    .withMessage('week query parameter is required')
    .isInt({ min: 0 })
    .withMessage('week must be an integer >= 0')
    .toInt()
];
