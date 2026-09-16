import { Request, Response } from 'express';
import { sendSuccess } from '../../../Common/utils/response';
import HttpCode from '../../../Common/constants/HttpCode';

class HealthController {
    public static ping(_req: Request, res: Response) {
        return sendSuccess(res, HttpCode.OK, { uptime: process.uptime() }, 'API is healthy.');
    }
}

export default HealthController;
