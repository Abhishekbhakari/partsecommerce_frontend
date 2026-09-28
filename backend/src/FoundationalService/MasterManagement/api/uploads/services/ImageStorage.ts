/**
 * Swappable image storage interface — mirrors the `OtpSender` pattern in
 * `CustomerAccountManagement/api/auth/services/OtpSender.ts`. `LocalDiskImageStorage` is the
 * default (dev) provider — it writes to `backend/uploads/` and serves it back via the
 * `express.static('/uploads', ...)` mount in `app.ts`. Swap `getImageStorage()` for an S3/
 * Cloudinary-backed implementation later without touching call sites.
 */
import crypto from 'crypto';
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

/**
 * Cloudinary provider (signed upload over plain HTTPS, no SDK dependency). Needed in production
 * on hosts with an ephemeral filesystem (Render's free/starter web services wipe local disk on
 * every deploy/restart) — proof-of-dispatch/delivery photos are evidence, and losing them on a
 * redeploy would defeat the point. Enabled automatically when all three CLOUDINARY_* env vars are
 * set; otherwise the app falls back to LocalDiskImageStorage (fine for local dev).
 * `filename` doubles as Cloudinary's public_id so remove() can address the asset.
 */
class CloudinaryImageStorage implements ImageStorage {
    constructor(
        private readonly cloudName: string,
        private readonly apiKey: string,
        private readonly apiSecret: string
    ) {}

    private sign(params: Record<string, string>): string {
        const toSign = Object.keys(params)
            .sort()
            .map((k) => `${k}=${params[k]}`)
            .join('&');
        return crypto.createHash('sha1').update(toSign + this.apiSecret).digest('hex');
    }

    async save(file: Express.Multer.File): Promise<StoredImage> {
        const timestamp = String(Math.floor(Date.now() / 1000));
        const folder = 'partshub';
        const publicId = uuidv4();
        const signature = this.sign({ folder, public_id: publicId, timestamp });

        const form = new FormData();
        form.append('file', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
        form.append('api_key', this.apiKey);
        form.append('timestamp', timestamp);
        form.append('folder', folder);
        form.append('public_id', publicId);
        form.append('signature', signature);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`, {
            method: 'POST',
            body: form
        });
        const body = (await res.json()) as { secure_url?: string; public_id?: string; error?: { message?: string } };
        if (!res.ok || !body.secure_url) {
            throw new Error(`Cloudinary upload failed: ${body.error?.message ?? res.statusText}`);
        }
        return { url: body.secure_url, filename: body.public_id ?? publicId };
    }

    async remove(filename: string): Promise<void> {
        try {
            if (!filename) return;
            const timestamp = String(Math.floor(Date.now() / 1000));
            const signature = this.sign({ public_id: filename, timestamp });
            const form = new URLSearchParams({
                public_id: filename,
                api_key: this.apiKey,
                timestamp,
                signature
            });
            await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`, {
                method: 'POST',
                body: form
            });
        } catch (error) {
            WinstonLogger.logger.log({
                message: `[ImageStorage:cloudinary] Failed to delete ${filename}: ${String(error)}`,
                level: 'warn'
            });
        }
    }
}

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
const cloudinaryConfigured = Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);

let storage: ImageStorage = cloudinaryConfigured
    ? new CloudinaryImageStorage(CLOUDINARY_CLOUD_NAME as string, CLOUDINARY_API_KEY as string, CLOUDINARY_API_SECRET as string)
    : new LocalDiskImageStorage();

if (process.env.NODE_ENV === 'production' && !cloudinaryConfigured) {
    WinstonLogger.logger.log({
        message:
            '[ImageStorage] Running in production with LOCAL DISK storage — uploaded images (product photos, dispatch/delivery proofs) will be lost on every redeploy/restart on hosts with an ephemeral filesystem. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.',
        level: 'warn'
    });
}

export const getImageStorage = (): ImageStorage => storage;

/** Test/production hook to swap the provider without touching call sites. */
export const setImageStorage = (custom: ImageStorage): void => {
    storage = custom;
};
