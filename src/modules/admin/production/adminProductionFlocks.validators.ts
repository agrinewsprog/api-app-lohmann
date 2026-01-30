import { body, param, query } from 'express-validator';

export const listFlocksValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Page size must be between 1 and 100')
    .toInt(),

  query('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer')
    .toInt(),

  query('search')
    .optional()
    .trim()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters'),
];

export const getFlockByIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Flock ID is required')
    .isInt({ min: 1 })
    .withMessage('Flock ID must be a positive integer')
    .toInt(),
];

export const createFlockValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer')
    .toInt(),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Flock name is required')
    .isLength({ min: 1, max: 120 })
    .withMessage('Flock name must be between 1 and 120 characters'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('Location must not exceed 160 characters'),

  body('notes')
    .optional()
    .trim()
    .isString(),
];

export const updateFlockValidation = [
  param('id')
    .notEmpty()
    .withMessage('Flock ID is required')
    .isInt({ min: 1 })
    .withMessage('Flock ID must be a positive integer')
    .toInt(),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage('Flock name must be between 1 and 120 characters'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('Location must not exceed 160 characters'),

  body('notes')
    .optional()
    .trim()
    .isString(),
];

export const deleteFlockValidation = [
  param('id')
    .notEmpty()
    .withMessage('Flock ID is required')
    .isInt({ min: 1 })
    .withMessage('Flock ID must be a positive integer')
    .toInt(),
];
