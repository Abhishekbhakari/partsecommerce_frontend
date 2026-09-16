import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import HttpSuccessMessage from '../../../../Common/constants/HttpSuccessMessage';
import SearchRepository from './repository/search.repository';
import { parsePagination, buildPagination } from '../../../../Common/utils/Pagination';
import { BadRequestException } from '../../../../Common/httpErrorClasses';

class SearchController {
    public static async autocomplete(req: Request, res: Response) {
        try {
            const q = String(req.query.q || '');
            if (!q) throw new BadRequestException('q query parameter is required.');
            const result = await SearchRepository.autocomplete(q);
            return sendSuccess(res, HttpCode.OK, result, HttpSuccessMessage.GET_ALL_RECORDS);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async fullSearch(req: Request, res: Response) {
        try {
            const q = String(req.query.q || '');
            if (!q) throw new BadRequestException('q query parameter is required.');
            const { page, pageSize, offset, limit } = parsePagination(req);
            const { rows, count } = await SearchRepository.fullSearch(q, offset, limit);
            return sendSuccess(
                res,
                HttpCode.OK,
                { items: rows, ...buildPagination(count, page, pageSize) },
                HttpSuccessMessage.GET_ALL_RECORDS
            );
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default SearchController;
