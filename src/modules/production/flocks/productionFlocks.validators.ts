import { body, param, query } from 'express-validator';

export const createProductionFlockValidation = [
  body('farmId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('farmId must be a positive integer')
    .toInt(),

  body('name')
    .notEmpty()
    .withMessage('name is required')
    .isLength({ min: 2, max: 120 })
    .withMessage('name must be between 2 and 120 characters'),

  body('flockNumber')
    .optional()
    .isLength({ max: 50 })
    .withMessage('flockNumber must be at most 50 characters'),

  body('hatchDate')
    .optional()
    .isISO8601()
    .withMessage('hatchDate must be a valid ISO date (YYYY-MM-DD)'),

  body('hensHoused')
    .optional()
    .isInt({ min: 0 })
    .withMessage('hensHoused must be a non-negative integer')
    .toInt(),

  body('productionPeriod')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('productionPeriod must be between 1 and 100')
    .toInt(),

  body('productId')
    .optional()
    .isLength({ min: 1, max: 36 })
    .withMessage('productId must be a valid UUID string'),

  body('location')
    .optional()
    .isLength({ max: 160 })
    .withMessage('location must be at most 160 characters'),

  body('notes')
    .optional()
    .isString()
    .withMessage('notes must be a string'),
];

export const updateProductionFlockValidation = [
  param('id')
    .notEmpty()
    .withMessage('id is required')
    .isInt({ min: 1 })
    .withMessage('id must be a positive integer')
    .toInt(),

  body('farmId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('farmId must be a positive integer')
    .toInt(),

  body('name')
    .optional()
    .isLength({ min: 2, max: 120 })
    .withMessage('name must be between 2 and 120 characters'),

  body('flockNumber')
    .optional()
    .isLength({ max: 50 })
    .withMessage('flockNumber must be at most 50 characters'),

  body('hatchDate')
    .optional()
    .isISO8601()
    .withMessage('hatchDate must be a valid ISO date (YYYY-MM-DD)'),

  body('hensHoused')
    .optional()
    .isInt({ min: 0 })
    .withMessage('hensHoused must be a non-negative integer')
    .toInt(),

  body('productionPeriod')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('productionPeriod must be between 1 and 100')
    .toInt(),

  body('productId')
    .optional()
    .isLength({ min: 1, max: 36 })
    .withMessage('productId must be a valid UUID string'),

  body('location')
    .optional()
    .isLength({ max: 160 })
    .withMessage('location must be at most 160 characters'),

  body('notes')
    .optional()
    .isString()
    .withMessage('notes must be a string'),
];

export const idParamValidation = [
  param('id')
    .notEmpty()
    .withMessage('id is required')
    .isInt({ min: 1 })
    .withMessage('id must be a positive integer')
    .toInt(),
];

export const listFlocksQueryValidation = [
  query('farmId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('farmId must be a positive integer')
    .toInt(),
];
