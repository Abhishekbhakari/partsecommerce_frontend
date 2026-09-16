import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import { requireOwner } from '../../../../Common/middleware/RBACMiddleware';
import StaffController from './staff.controller';

const staffRouter = Router();

staffRouter.use(TokenMiddleware.requireAdminAuth, requireOwner);

staffRouter.get('/', StaffController.list);
staffRouter.post('/', StaffController.invite);
staffRouter.patch('/:id/role', StaffController.changeRole);
staffRouter.delete('/:id', StaffController.remove);

export default staffRouter;
