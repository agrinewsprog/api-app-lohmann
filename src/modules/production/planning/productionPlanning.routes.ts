import { Router } from 'express';
import { ProductionPlanningController } from './productionPlanning.controller';
import { validate } from '../../../middlewares/validate';
import { authenticateJWT } from '../../../middlewares/auth';
import { executeQueryValidation } from './productionPlanning.validators';

const router = Router();
const controller = new ProductionPlanningController();

router.get('/execute', authenticateJWT, validate(executeQueryValidation), controller.execute);

export default router;
