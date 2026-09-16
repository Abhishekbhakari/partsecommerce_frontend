import { Router } from 'express';
import HealthController from './health.controller';

const healthRouter = Router();

healthRouter.get('/', HealthController.ping);

export default healthRouter;
