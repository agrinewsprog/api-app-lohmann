import { query, param, ValidationChain } from 'express-validator';

/**
 * Validation for GET /api/weight/uniformity
 * Required: flockId (positive integer), productId (non-empty string)
 */
export const getUniformityValidation: ValidationChain[] = [
  query('flockId')
    .notEmpty()
    .withMessage('flockId query parameter is required')
    .isInt({ min: 1 })
    .withMessage('flockId must be a positive integer')
    .toInt(),
  query('productId')
    .notEmpty()
    .withMessage('productId query parameter is required')
    .isString()
    .withMessage('productId must be a string')
    .trim()
];

/**
 * Validation for GET /api/weight/uniformity/week
 * Required: flockId (positive integer), productId (non-empty string), week (integer >= 0)
 */
export const getUniformityWeekValidation: ValidationChain[] = [
  query('flockId')
    .notEmpty()
    .withMessage('flockId query parameter is required')
    .isInt({ min: 1 })
    .withMessage('flockId must be a positive integer')
    .toInt(),
  query('productId')
    .notEmpty()
    .withMessage('productId query parameter is required')
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

/**
 * Validation for GET /api/weight/uniformity/:uuid
 * Required: uuid (non-empty string)
 */
export const getUniformityByUuidValidation: ValidationChain[] = [
  param('uuid')
    .notEmpty()
    .withMessage('uuid parameter is required')
    .isString()
    .withMessage('uuid must be a string')
    .trim()
];

/**
 * Validation for GET /api/weight/uniformity/last
 * Optional: productId (string)
 */
export const getUniformityLastValidation: ValidationChain[] = [
  query('productId')
    .optional()
    .isString()
    .withMessage('productId must be a string')
    .trim()
];

/**
 * Validation for GET /api/weight/uniformity/:uniformityUuid/week
 * Required: uniformityUuid (non-empty string), week (integer >= 0)
 */
export const getUniformityWeekByUuidValidation: ValidationChain[] = [
  param('uniformityUuid')
    .notEmpty()
    .withMessage('uniformityUuid parameter is required')
    .isString()
    .withMessage('uniformityUuid must be a string')
    .trim(),
  query('week')
    .notEmpty()
    .withMessage('week query parameter is required')
    .isInt({ min: 0 })
    .withMessage('week must be an integer >= 0')
    .toInt()
];
