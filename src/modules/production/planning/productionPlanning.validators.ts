import { query } from 'express-validator';

export const executeQueryValidation = [
  query('flockId')
    .notEmpty()
    .withMessage('flockId is required')
    .isInt({ min: 1 })
    .withMessage('flockId must be a positive integer')
    .toInt(),
];
