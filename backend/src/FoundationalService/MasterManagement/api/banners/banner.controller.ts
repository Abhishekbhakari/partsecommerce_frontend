import { Request, Response } from 'express';
import { ErrorHandler } from '../../../../Common/utils/ErrorHandler';
import { sendSuccess } from '../../../../Common/utils/response';
import HttpCode from '../../../../Common/constants/HttpCode';
import HttpSuccessMessage from '../../../../Common/constants/HttpSuccessMessage';
import BannerRepository from './repository/banner.repository';
import { RecordNotFoundException } from '../../../../Common/httpErrorClasses';
import { BannerSchema, UpdateBannerSchema } from './validations/banner.validation';

class BannerController {
    public static async list(_req: Request, res: Response) {
        try {
            const banners = await BannerRepository.findAll();
            return sendSuccess(res, HttpCode.OK, banners, HttpSuccessMessage.GET_ALL_RECORDS);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async create(req: Request, res: Response) {
        try {
            const payload = BannerSchema.parse(req.body);
            const banner = await BannerRepository.create(payload);
            return sendSuccess(res, HttpCode.CREATED, banner, HttpSuccessMessage.RECORD_CREATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async update(req: Request, res: Response) {
        try {
            const payload = UpdateBannerSchema.parse(req.body);
            const banner = await BannerRepository.findById(Number(req.params.id));
            if (!banner) throw new RecordNotFoundException('Banner not found.');
            await BannerRepository.update(banner.id, payload);
            return sendSuccess(res, HttpCode.OK, await BannerRepository.findById(banner.id), HttpSuccessMessage.RECORD_UPDATED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }

    public static async remove(req: Request, res: Response) {
        try {
            const banner = await BannerRepository.findById(Number(req.params.id));
            if (!banner) throw new RecordNotFoundException('Banner not found.');
            await BannerRepository.remove(banner.id);
            return sendSuccess(res, HttpCode.OK, { success: true }, HttpSuccessMessage.RECORD_DELETED);
        } catch (error) {
            return ErrorHandler.commonErrorHandler(error, res);
        }
    }
}

export default BannerController;
