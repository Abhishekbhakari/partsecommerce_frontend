import { getImageStorage } from './services/ImageStorage';
import { BadRequestException } from '../../../../Common/httpErrorClasses';

class UploadService {
    /** `baseUrl` (e.g. `http://localhost:4000`) is prepended so the returned URL is directly
     *  usable as an `<img src>` from the frontend's own origin, regardless of storage backend. */
    async saveImage(file: Express.Multer.File | undefined, baseUrl: string) {
        if (!file) {
            throw new BadRequestException('No file uploaded. Send the image as multipart field "file".');
        }
        const stored = await getImageStorage().save(file);
        return { url: `${baseUrl}${stored.url}`, filename: stored.filename };
    }

    async removeImage(filename: string) {
        await getImageStorage().remove(filename);
        return { success: true };
    }
}

export default new UploadService();
