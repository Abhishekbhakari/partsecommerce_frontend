import { Request, Response } from 'express';
import { sendSuccess } from '../../../Common/utils/response';
import HttpCode from '../../../Common/constants/HttpCode';
import sequelize from '../../../Common/database/config/sequelize';

class HealthController {
    /** Reports DB connectivity explicitly — the server now always starts listening even if the
     * DB is unreachable (see server.ts), so this is the fastest way to tell "deployed but DB
     * misconfigured" apart from "deployed and fine" without reading platform log output. */
    public static async ping(_req: Request, res: Response) {
        let database: 'connected' | 'unreachable' = 'unreachable';
        let databaseError: string | undefined;
        try {
            await sequelize.authenticate();
            database = 'connected';
        } catch (error) {
            databaseError = error instanceof Error ? error.message : String(error);
        }
        return sendSuccess(
            res,
            HttpCode.OK,
            { uptime: process.uptime(), database, ...(databaseError ? { databaseError } : {}) },
            'API is healthy.'
        );
    }
}

export default HealthController;
