import AddressRepository from './repository/address.repository';
import { ForbiddenException, RecordNotFoundException } from '../../../../Common/httpErrorClasses';
import { AddressPayload, UpdateAddressPayload } from './validations/address.validation';

class AddressService {
    list(userId: number) {
        return AddressRepository.findAllForUser(userId);
    }

    async create(userId: number, payload: AddressPayload) {
        if (payload.isDefault) {
            await AddressRepository.clearDefault(userId);
        }
        return AddressRepository.create(userId, payload);
    }

    async update(userId: number, id: number, payload: UpdateAddressPayload) {
        const address = await AddressRepository.findById(id);
        if (!address) throw new RecordNotFoundException('Address not found.');
        if (address.userId !== userId) throw new ForbiddenException();

        if (payload.isDefault) {
            await AddressRepository.clearDefault(userId);
        }
        await AddressRepository.update(id, payload);
        return AddressRepository.findById(id);
    }

    async remove(userId: number, id: number) {
        const address = await AddressRepository.findById(id);
        if (!address) throw new RecordNotFoundException('Address not found.');
        if (address.userId !== userId) throw new ForbiddenException();
        await AddressRepository.remove(id);
        return { success: true };
    }
}

export default new AddressService();
