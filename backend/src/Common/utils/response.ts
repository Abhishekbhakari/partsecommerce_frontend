import { Response } from 'express';

/** Standard success envelope: `{ success: true, message, data }` — see docs/CODING_STANDARDS.md. */
export const sendSuccess = <T>(
    res: Response,
    statusCode: number,
    data: T,
    message: string = 'Success'
): Response => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};
