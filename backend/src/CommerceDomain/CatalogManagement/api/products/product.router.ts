import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import RBAC from '../../../../Common/middleware/RBACMiddleware';
import { CATALOG_MANAGER_ROLES } from '../../../../Common/constants/Roles';
import { csvUpload } from '../../../../Common/middleware/uploadMiddleware';
import ProductController from './product.controller';
import BulkImportExportController from './bulkImportExport.controller';

const productRouter = Router();
const productAdminRouter = Router();
const sellerProductRouter = Router();

productRouter.get('/', ProductController.list);
productRouter.get('/:slug', ProductController.getBySlug);

productAdminRouter.use(TokenMiddleware.requireAdminAuth, RBAC.requireRole(...CATALOG_MANAGER_ROLES));
productAdminRouter.post('/', ProductController.create);
productAdminRouter.patch('/:id', ProductController.update);
productAdminRouter.delete('/:id', ProductController.remove);
productAdminRouter.patch('/:id/inventory', ProductController.updateInventory);
productAdminRouter.post('/import', csvUpload.single('file'), BulkImportExportController.importCsv);
productAdminRouter.get('/export', BulkImportExportController.exportCsv);

// Seller self-service product CRUD — reuses ProductService's shared internal create/update
// logic (see product.service.ts) with sellerId always taken from the authenticated seller.
sellerProductRouter.use(TokenMiddleware.requireSellerAuth);
sellerProductRouter.get('/', ProductController.sellerList);
sellerProductRouter.post('/', ProductController.sellerCreate);
sellerProductRouter.patch('/:id', ProductController.sellerUpdate);
sellerProductRouter.delete('/:id', ProductController.sellerRemove);
sellerProductRouter.patch('/:id/inventory', ProductController.updateInventory);
sellerProductRouter.post('/import', csvUpload.single('file'), BulkImportExportController.importCsv);

export { productRouter, productAdminRouter, sellerProductRouter };
