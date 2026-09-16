import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import HttpSuccessMessage from '../../../../Common/constants/HttpSuccessMessage';
import CartService from './cart.service';
import { AddCartItemSchema, UpdateCartItemSchema, ApplyCouponSchema } from './validations/cart.validation';
import { BadRequestException } from '../../../../Common/httpErrorClasses';

class CartController {
    public static async getCart(req: Request, res: Response) {
        try {
            const cart = await CartService.getCart(req);
            return sendSuccess(res, HttpCode.OK, cart, HttpSuccessMessage.GET_RECORD);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async addItem(req: Request, res: Response) {
        try {
            const payload = AddCartItemSchema.parse(req.body);
            const cart = await CartService.addItem(req, payload);
            return sendSuccess(res, HttpCode.OK, cart, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async updateItem(req: Request, res: Response) {
        try {
            const { qty } = UpdateCartItemSchema.parse(req.body);
            const cart = await CartService.updateItem(req, Number(req.params.id), qty);
            return sendSuccess(res, HttpCode.OK, cart, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async removeItem(req: Request, res: Response) {
        try {
            const cart = await CartService.removeItem(req, Number(req.params.id));
            return sendSuccess(res, HttpCode.OK, cart, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async applyCoupon(req: Request, res: Response) {
        try {
            const payload = ApplyCouponSchema.parse(req.body);
            const cart = await CartService.applyCoupon(req, payload);
            return sendSuccess(res, HttpCode.OK, cart, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async removeCoupon(req: Request, res: Response) {
        try {
            const cart = await CartService.removeCoupon(req);
            return sendSuccess(res, HttpCode.OK, cart, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async pincodeCheck(req: Request, res: Response) {
        try {
            const pincode = String(req.query.pincode || '');
            if (!pincode) throw new BadRequestException('pincode query parameter is required.');
            const result = CartService.checkPincode(pincode);
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.GET_RECORD);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default CartController;
