import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import RBAC, { requireOwner } from '../../../../Common/middleware/RBACMiddleware';
import { CATALOG_MANAGER_ROLES } from '../../../../Common/constants/Roles';
import SellerAdminController from './seller-admin.controller';

const sellerAdminRouter = Router();
const payoutAdminRouter = Router();

sellerAdminRouter.use(TokenMiddleware.requireAdminAuth);

// Read access — any catalog-manager-tier admin. Approve/reject/suspend/commission and payout
// generation are business-sensitive, so they require the owner role (per docs/PHASE3_ADDENDUM.md §4).
sellerAdminRouter.get('/', RBAC.requireRole(...CATALOG_MANAGER_ROLES), SellerAdminController.list);
sellerAdminRouter.get('/:id', RBAC.requireRole(...CATALOG_MANAGER_ROLES), SellerAdminController.getById);
sellerAdminRouter.patch('/:id/approve', requireOwner, SellerAdminController.approve);
sellerAdminRouter.patch('/:id/reject', requireOwner, SellerAdminController.reject);
sellerAdminRouter.patch('/:id/suspend', requireOwner, SellerAdminController.suspend);
sellerAdminRouter.patch('/:id/commission', requireOwner, SellerAdminController.setCommission);
sellerAdminRouter.post('/:id/payouts', requireOwner, SellerAdminController.generatePayout);

payoutAdminRouter.use(TokenMiddleware.requireAdminAuth, requireOwner);
payoutAdminRouter.patch('/:id/mark-paid', SellerAdminController.markPayoutPaid);

export { sellerAdminRouter, payoutAdminRouter };
