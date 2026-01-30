import { query } from 'express-validator';

export const getGrowthValidation = [
  query('productId')
    .notEmpty()
    .withMessage('productId is required')
    .isInt({ min: 1 })
    .withMessage('productId must be a positive integer')
    .toInt(),

  query('week')
    .optional()
    .isInt({ min: 0 })
    .withMessage('week must be a non-negative integer')
    .toInt(),

  query('sex')
    .optional()
    .isIn(['female', 'male'])
    .withMessage('sex must be either "female" or "male"')
];
