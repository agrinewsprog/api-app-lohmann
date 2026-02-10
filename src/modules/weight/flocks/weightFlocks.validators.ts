import { body, param } from 'express-validator';

export const createWeightFlockValidation = [
  body('name')
    .notEmpty()
    .withMessage('name is required')
    .isLength({ min: 2, max: 120 })
    .withMessage('name must be between 2 and 120 characters'),

  body('location')
    .optional()
    .isLength({ max: 160 })
    .withMessage('location must be at most 160 characters'),

  body('notes')
    .optional()
    .isString()
    .withMessage('notes must be a string'),

  body('productId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('productId must be a positive integer')
    .toInt(),

  body('hatchDate')
    .optional()
    .isISO8601()
    .withMessage('hatchDate must be a valid date (YYYY-MM-DD)'),
];

export const updateWeightFlockValidation = [
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

  body('location')
    .optional()
    .isLength({ max: 160 })
    .withMessage('location must be at most 160 characters'),

  body('notes')
    .optional()
    .isString()
    .withMessage('notes must be a string'),

  body('productId')
    .optional({ values: 'null' })
    .isInt({ min: 1 })
    .withMessage('productId must be a positive integer')
    .toInt(),

  body('hatchDate')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('hatchDate must be a valid date (YYYY-MM-DD)'),
];

export const idParamValidation = [
  param('id')
    .notEmpty()
    .withMessage('id is required')
    .isInt({ min: 1 })
    .withMessage('id must be a positive integer')
    .toInt(),
];
