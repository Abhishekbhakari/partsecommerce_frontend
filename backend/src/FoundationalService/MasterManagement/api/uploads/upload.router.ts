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

export default uploadRouter;
