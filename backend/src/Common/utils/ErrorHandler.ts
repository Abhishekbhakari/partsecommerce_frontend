import { Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../httpErrorClasses';
import WinstonLogger from '../logger/WinstonLogger';

interface SequelizeLikeError {
    name?: string;
    errors?: { path?: string; message: string }[];
}

export class ErrorHandler {
    /**
     * Single entry point every controller catch-block funnels into. Response shape is
     * always `{ success: false, message, errors? }` per docs/CODING_STANDARDS.md.
     */
    static commonErrorHandler(error: unknown, res: Response): Response {
        if (error instanceof ZodError) {
            const firstError = error.errors[0];
            return res.status(422).json({
                success: false,
                message: firstError ? firstError.message : 'Invalid input data.',
                errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }))
            });
        }

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }

        const sequelizeError = error as SequelizeLikeError;

        if (sequelizeError?.name === 'SequelizeUniqueConstraintError') {
            return res
                .status(409)
                .json({ success: false, message: 'A record with these details already exists.' });
        }

        if (sequelizeError?.name === 'SequelizeValidationError') {
            return res.status(422).json({
                success: false,
                message: 'Database validation failed.',
                errors: sequelizeError.errors?.map((e) => ({ field: e.path, message: e.message }))
            });
        }

        if (sequelizeError?.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(409).json({
                success: false,
                message: 'This record is linked to other data and cannot be modified.'
            });
        }

        WinstonLogger.logger.log({ message: `Unhandled error: ${String(error)}`, level: 'error' });
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}
