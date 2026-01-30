import { param, query } from 'express-validator';

export const productIdParamValidation = [
  param('productId')
    .notEmpty()
    .withMessage('productId is required')
    .isLength({ min: 1, max: 36 })
    .withMessage('productId must be a valid string'),
];

export const listProductsQueryValidation = [
  query('group')
    .optional()
    .isString()
    .withMessage('group must be a string'),

  query('client')
    .optional()
    .isString()
    .withMessage('client must be a string'),

  query('color')
    .optional()
    .isString()
    .withMessage('color must be a string'),
];
