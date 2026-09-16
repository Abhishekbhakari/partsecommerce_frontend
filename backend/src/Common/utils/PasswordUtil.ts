import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

class PasswordUtil {
    async hash(plain: string): Promise<string> {
        return bcrypt.hash(plain, SALT_ROUNDS);
    }

    async compare(plain: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plain, hash);
    }
}

export default new PasswordUtil();
