import { Request, Response } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import { Order, ProductVariant } from '../../../../Common/database/models';

class ReportController {
    public static async sales(req: Request, res: Response) {
        try {
            const from = req.query.from ? new Date(String(req.query.from)) : new Date(Date.now() - 30 * 86400000);
            const to = req.query.to ? new Date(String(req.query.to)) : new Date();
            const groupBy = (req.query.groupBy as string) || 'day';
            const truncUnit = groupBy === 'month' ? 'month' : groupBy === 'week' ? 'week' : 'day';

            const rows = await Order.findAll({
                attributes: [
                    [fn('date_trunc', truncUnit, col('placedAt')), 'bucket'],
                    [fn('SUM', col('total')), 'total'],
                    [fn('COUNT', col('id')), 'orderCount']
                ],
                where: { placedAt: { [Op.between]: [from, to] }, status: { [Op.ne]: 'cancelled' } },
                group: [literal('bucket') as unknown as string],
                order: [[literal('bucket'), 'ASC']],
                raw: true
            });

            return sendSuccess(res, HttpCode.OK, { series: rows }, 'Sales report generated.');
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async inventory(_req: Request, res: Response) {
        try {
            const rows = await ProductVariant.findAll({
                attributes: ['id', 'productId', 'name', 'stock'],
                order: [['stock', 'ASC']],
                limit: 50
            });
            return sendSuccess(res, HttpCode.OK, { series: rows }, 'Inventory report generated.');
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default ReportController;
