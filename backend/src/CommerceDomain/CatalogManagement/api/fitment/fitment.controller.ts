import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import HttpSuccessMessage from '../../../../Common/constants/HttpSuccessMessage';
import FitmentRepository from './repository/fitment.repository';
import { parsePagination } from '../../../../Common/utils/Pagination';
import { BadRequestException } from '../../../../Common/httpErrorClasses';

class FitmentController {
    public static async lookup(req: Request, res: Response) {
        try {
            const { make, model, year } = req.query;
            if (!make || !model) throw new BadRequestException('make and model query params are required.');
            const { offset, limit } = parsePagination(req);
            const { rows, count } = await FitmentRepository.lookup(
                String(make),
                String(model),
                year ? Number(year) : undefined,
                offset,
                limit
            );
            return sendSuccess(res, HttpCode.OK, { items: rows, total: count }, HttpSuccessMessage.GET_ALL_RECORDS);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async options(req: Request, res: Response) {
        try {
            const make = req.query.make ? String(req.query.make) : undefined;
            const model = req.query.model ? String(req.query.model) : undefined;
            const [makes, models, years] = await Promise.all([
                FitmentRepository.makes(),
                FitmentRepository.models(make),
                FitmentRepository.years(make, model)
            ]);
            return sendSuccess(res, HttpCode.OK, { makes, models, years }, HttpSuccessMessage.GET_ALL_RECORDS);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default FitmentController;
