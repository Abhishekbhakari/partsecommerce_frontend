import { Router } from 'express';
import TokenMiddleware from '../../../../Common/middleware/TokenMiddleware';
import RBAC from '../../../../Common/middleware/RBACMiddleware';
import { CATALOG_MANAGER_ROLES } from '../../../../Common/constants/Roles';
import { imageUpload } from '../../../../Common/middleware/uploadMiddleware';
import UploadController from './upload.controller';

const uploadRouter = Router();

uploadRouter.use(TokenMiddleware.requireAdminAuth, RBAC.requireRole(...CATALOG_MANAGER_ROLES));
uploadRouter.post('/image', imageUpload.single('file'), UploadController.uploadImage);
uploadRouter.delete('/image/:filename', UploadController.removeImage);

/** Sellers upload their own product photos and dispatch/delivery proof photos through this — the
 * admin router above is role-gated to staff, so without a seller-scoped twin every seller image
 * upload 401s. Delete is intentionally not exposed: a seller must not be able to remove a proof
 * photo after submitting it (it is dispute evidence); removing an unsubmitted photo from a form
 * just drops the URL client-side. */
const sellerUploadRouter = Router();
sellerUploadRouter.use(TokenMiddleware.requireSellerAuth);
sellerUploadRouter.post('/image', imageUpload.single('file'), UploadController.uploadImage);

export { sellerUploadRouter };
export default uploadRouter;
