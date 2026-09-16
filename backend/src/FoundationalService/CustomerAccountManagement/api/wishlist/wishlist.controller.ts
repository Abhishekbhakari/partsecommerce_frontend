import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import HttpSuccessMessage from '../../../../Common/constants/HttpSuccessMessage';
import WishlistRepository from './repository/wishlist.repository';
import { RecordNotFoundException } from '../../../../Common/httpErrorClasses';
import { Product } from '../../../../Common/database/models';

class WishlistController {
    public static async list(req: Request, res: Response) {
        try {
            const products = await WishlistRepository.findAllForUser(req.user!.userId);
            return sendSuccess(res, HttpCode.OK, products, HttpSuccessMessage.GET_ALL_RECORDS);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async add(req: Request, res: Response) {
        try {
            const productId = Number(req.params.productId);
            const product = await Product.findByPk(productId);
            if (!product) throw new RecordNotFoundException('Product not found.');

            const existing = await WishlistRepository.exists(req.user!.userId, productId);
            if (!existing) {
                await WishlistRepository.add(req.user!.userId, productId);
            }
            return sendSuccess(res, HttpCode.OK, { success: true }, HttpSuccessMessage.RECORD_CREATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async remove(req: Request, res: Response) {
        try {
            await WishlistRepository.remove(req.user!.userId, Number(req.params.productId));
            return sendSuccess(res, HttpCode.OK, { success: true }, HttpSuccessMessage.RECORD_DELETED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default WishlistController;
