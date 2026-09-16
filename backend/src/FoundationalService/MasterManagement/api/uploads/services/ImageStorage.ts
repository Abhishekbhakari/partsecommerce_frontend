/**
 * Swappable image storage interface — mirrors the `OtpSender` pattern in
 * `CustomerAccountManagement/api/auth/services/OtpSender.ts`. `LocalDiskImageStorage` is the
 * default (dev) provider — it writes to `backend/uploads/` and serves it back via the
 * `express.static('/uploads', ...)` mount in `app.ts`. Swap `getImageStorage()` for an S3/
 * Cloudinary-backed implementation later without touching call sites.
 */
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import WinstonLogger from '../../../../../Common/logger/WinstonLogger';

export interface StoredImage {
    url: string;
    filename: string;
}

export interface ImageStorage {
    /** Persists the uploaded file buffer and returns its public URL + generated filename. */
    save(file: Express.Multer.File): Promise<StoredImage>;
    /** Best-effort delete — must not throw if the file is already gone. */
    remove(filename: string): Promise<void>;
}

/** Directory the server process is started from is always `backend/` (see package.json scripts). */
export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

const ensureUploadDir = () => {
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
};

const safeExtension = (originalName: string): string => {
    const ext = path.extname(originalName).toLowerCase();
    // Guard against path traversal / weird client-supplied extensions.
    return /^\.[a-z0-9]{1,10}$/.test(ext) ? ext : '';
};

class LocalDiskImageStorage implements ImageStorage {
    async save(file: Express.Multer.File): Promise<StoredImage> {
        ensureUploadDir();
        const filename = `${uuidv4()}${safeExtension(file.originalname)}`;
        const destination = path.join(UPLOAD_DIR, filename);
        await fs.promises.writeFile(destination, file.buffer);
        return { url: `/uploads/${filename}`, filename };
    }

    async remove(filename: string): Promise<void> {
        try {
            // Reject anything that isn't a bare filename to prevent path traversal.
            if (!filename || filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
                return;
            }
            const target = path.join(UPLOAD_DIR, filename);
            await fs.promises.unlink(target);
        } catch (error) {
            const err = error as NodeJS.ErrnoException;
            if (err?.code !== 'ENOENT') {
                WinstonLogger.logger.log({
                    message: `[ImageStorage:local] Failed to delete ${filename}: ${err?.message}`,
                    level: 'warn'
                });
            }
            // Best-effort delete — swallow missing-file and other errors.
        }
    }
}

let storage: ImageStorage = new LocalDiskImageStorage();

export const getImageStorage = (): ImageStorage => storage;

/** Test/production hook to swap the provider without touching call sites. */
export const setImageStorage = (custom: ImageStorage): void => {
    storage = custom;
};
