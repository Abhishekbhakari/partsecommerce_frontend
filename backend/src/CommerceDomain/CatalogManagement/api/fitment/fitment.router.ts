import { Router } from 'express';
import FitmentController from './fitment.controller';

const fitmentRouter = Router();

fitmentRouter.get('/lookup', FitmentController.lookup);
fitmentRouter.get('/options', FitmentController.options);

export default fitmentRouter;
