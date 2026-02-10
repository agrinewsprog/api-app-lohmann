import { body, query, ValidationChain } from 'express-validator';

export const saveWeekValidation: ValidationChain[] = [
  body('flockId')
    .notEmpty()
    .withMessage('flockId is required')
    .isInt({ min: 1 })
    .withMessage('flockId must be a positive integer')
    .toInt(),

  body('week')
    .notEmpty()
    .withMessage('week is required')
    .isInt({ min: 0 })
    .withMessage('week must be an integer >= 0')
    .toInt(),

  body('sex')
    .notEmpty()
    .withMessage('sex is required')
    .isIn(['female', 'male'])
    .withMessage('sex must be "female" or "male"'),

  body('weights')
    .isArray({ min: 2 })
    .withMessage('weights must be an array with at least 2 items'),

  body('weights.*')
    .isFloat({ gt: 0 })
    .withMessage('each weight must be a positive number')
    .toFloat(),
];

export const getWeekValidation: ValidationChain[] = [
  query('flockId')
    .notEmpty()
    .withMessage('flockId query parameter is required')
    .isInt({ min: 1 })
    .withMessage('flockId must be a positive integer')
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

export const getHistoryValidation: ValidationChain[] = [
  query('flockId')
    .notEmpty()
    .withMessage('flockId query parameter is required')
    .isInt({ min: 1 })
    .withMessage('flockId must be a positive integer')
    .toInt(),

  query('sex')
    .optional()
    .isIn(['female', 'male'])
    .withMessage('sex must be "female" or "male"'),
];
