import { Banner } from '../../../../../Common/database/models';

class BannerRepository {
    findAll() {
        return Banner.findAll({ order: [['createdAt', 'DESC']] });
    }

    findById(id: number) {
        return Banner.findByPk(id);
    }

    create(data: Record<string, unknown>) {
        return Banner.create(data as never);
    }

    update(id: number, data: Record<string, unknown>) {
        return Banner.update(data, { where: { id } });
    }

    remove(id: number) {
        return Banner.destroy({ where: { id } });
    }
}

export default new BannerRepository();
