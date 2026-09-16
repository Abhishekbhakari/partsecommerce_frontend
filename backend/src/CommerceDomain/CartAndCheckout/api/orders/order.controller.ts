import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import HttpSuccessMessage from '../../../../Common/constants/HttpSuccessMessage';
import OrderService from './order.service';
import { CancelOrderSchema, ReturnOrderSchema, UpdateOrderStatusSchema } from './validations/order.validation';
import { parsePagination } from '../../../../Common/utils/Pagination';

class OrderController {
    public static async getById(req: Request, res: Response) {
        try {
            const order = await OrderService.getById(Number(req.params.id), req.user);
            return sendSuccess(res, HttpCode.OK, order, HttpSuccessMessage.GET_RECORD);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async listMine(req: Request, res: Response) {
        try {
            const { page, pageSize, offset, limit } = parsePagination(req);
            const result = await OrderService.listForUser(req.user!.userId, page, pageSize, offset, limit);
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.GET_ALL_RECORDS);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async cancel(req: Request, res: Response) {
        try {
            const payload = CancelOrderSchema.parse(req.body);
            const order = await OrderService.cancel(Number(req.params.id), req.user!, payload);
            return sendSuccess(res, HttpCode.OK, order, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async requestReturn(req: Request, res: Response) {
        try {
            const payload = ReturnOrderSchema.parse(req.body);
            const result = await OrderService.requestReturn(Number(req.params.id), req.user!, payload);
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async listAdmin(req: Request, res: Response) {
        try {
            const { page, pageSize, offset, limit } = parsePagination(req);
            const result = await OrderService.listAdmin(
                { status: req.query.status as string, q: req.query.q as string },
                page,
                pageSize,
                offset,
                limit
            );
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.GET_ALL_RECORDS);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async updateStatus(req: Request, res: Response) {
        try {
            const { status } = UpdateOrderStatusSchema.parse(req.body);
            const order = await OrderService.updateStatus(Number(req.params.id), status);
            return sendSuccess(res, HttpCode.OK, order, HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async listCustomers(req: Request, res: Response) {
        try {
            const { page, pageSize, offset, limit } = parsePagination(req);
            const result = await OrderService.listCustomers(page, pageSize, offset, limit, req.query.q as string);
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.GET_ALL_RECORDS);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async getCustomer(req: Request, res: Response) {
        try {
            const customer = await OrderService.getCustomer(Number(req.params.id));
            return sendSuccess(res, HttpCode.OK, customer, HttpSuccessMessage.GET_RECORD);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    /** Stub GST invoice — a production build would render a PDF via a templating lib (e.g. pdfkit). */
    public static async invoice(req: Request, res: Response) {
        try {
            const order = await OrderService.getById(Number(req.params.id), req.user);
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename="invoice-${order.orderNumber}.txt"`);
            return res
                .status(HttpCode.OK)
                .send(
                    `INVOICE\nOrder: ${order.orderNumber}\nTotal: INR ${(order.total / 100).toFixed(2)}\nGST: INR ${(
                        order.gstAmount / 100
                    ).toFixed(2)}\n(Stub invoice — swap for a real PDF renderer in production.)`
                );
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default OrderController;
