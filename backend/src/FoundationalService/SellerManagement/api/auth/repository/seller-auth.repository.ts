import { Seller } from '../../../../../Common/database/models';

class SellerAuthRepository {
    findByEmail(email: string) {
        return Seller.findOne({ where: { email } });
    }

    findById(id: number) {
        return Seller.findByPk(id);
    }

    create(data: Record<string, unknown>) {
        return Seller.create(data as never);
    }
}

export default new SellerAuthRepository();
