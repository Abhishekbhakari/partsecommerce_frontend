import ProfileRepository from './repository/profile.repository';
import { RecordNotFoundException } from '../../../../Common/httpErrorClasses';
import { UpdateProfilePayload } from './validations/profile.validation';

class ProfileService {
    async getProfile(userId: number) {
        const user = await ProfileRepository.findById(userId);
        if (!user) throw new RecordNotFoundException('User not found.');
        return user;
    }

    async updateProfile(userId: number, payload: UpdateProfilePayload) {
        const user = await ProfileRepository.findById(userId);
        if (!user) throw new RecordNotFoundException('User not found.');
        await ProfileRepository.update(userId, payload);
        return ProfileRepository.findById(userId);
    }
}

export default new ProfileService();
