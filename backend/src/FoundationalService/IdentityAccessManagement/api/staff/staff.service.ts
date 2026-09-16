import crypto from 'crypto';
import StaffRepository from './repository/staff.repository';
import PasswordUtil from '../../../../Common/utils/PasswordUtil';
import { DuplicateRecordException, RecordNotFoundException } from '../../../../Common/httpErrorClasses';
import { InviteStaffPayload } from './validations/staff.validation';
import WinstonLogger from '../../../../Common/logger/WinstonLogger';

/** Never leak `passwordHash` (or other sensitive columns) to API responses. */
const publicStaff = (staff: { toJSON: () => Record<string, unknown> }) => {
    const { passwordHash: _passwordHash, ...rest } = staff.toJSON();
    return rest;
};

class StaffService {
    async list() {
        const staff = await StaffRepository.findAll();
        return staff.map(publicStaff);
    }

    async invite(payload: InviteStaffPayload) {
        const existing = await StaffRepository.findByEmail(payload.email.toLowerCase());
        if (existing) {
            throw new DuplicateRecordException('A staff member with this email already exists.');
        }

        // Temporary password — in production this would be emailed via an invite link/reset flow.
        const tempPassword = crypto.randomBytes(9).toString('base64url');
        const passwordHash = await PasswordUtil.hash(tempPassword);

        const staff = await StaffRepository.create({
            name: payload.name,
            email: payload.email.toLowerCase(),
            passwordHash,
            role: payload.role
        });

        WinstonLogger.logger.log({
            message: `[StaffService] Invited ${staff.email} with temp password (stub email/notification): ${tempPassword}`,
            level: 'info'
        });

        return publicStaff(staff);
    }

    async changeRole(id: number, role: string) {
        const staff = await StaffRepository.findById(id);
        if (!staff) throw new RecordNotFoundException('Staff member not found.');
        await StaffRepository.updateRole(id, role);
        const updated = await StaffRepository.findById(id);
        return publicStaff(updated!);
    }

    async remove(id: number) {
        const staff = await StaffRepository.findById(id);
        if (!staff) throw new RecordNotFoundException('Staff member not found.');
        await StaffRepository.remove(id);
        return { success: true };
    }
}

export default new StaffService();
