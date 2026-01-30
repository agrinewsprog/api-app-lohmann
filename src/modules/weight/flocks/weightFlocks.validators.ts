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
];

export const idParamValidation = [
  param('id')
    .notEmpty()
    .withMessage('id is required')
    .isInt({ min: 1 })
    .withMessage('id must be a positive integer')
    .toInt(),
];
