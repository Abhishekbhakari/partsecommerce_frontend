import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

/** CMS banner — supports /admin/banners endpoints in API_CONTRACT.md. */
export interface BannerAttributes {
    id: number;
    title: string;
    imageUrl: string;
    link: string | null;
    placement: string;
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export type BannerCreationAttributes = Optional<
    BannerAttributes,
    'id' | 'link' | 'active' | 'createdAt' | 'updatedAt'
>;

export class Banner
    extends Model<BannerAttributes, BannerCreationAttributes>
    implements BannerAttributes
{
    declare id: number;
    declare title: string;
    declare imageUrl: string;
    declare link: string | null;
    declare placement: string;
    declare active: boolean;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Banner.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        title: { type: DataTypes.STRING, allowNull: false },
        imageUrl: { type: DataTypes.STRING, allowNull: false },
        link: { type: DataTypes.STRING, allowNull: true },
        placement: { type: DataTypes.STRING, allowNull: false, defaultValue: 'home' },
        active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    },
    { sequelize, tableName: 'banners', modelName: 'Banner', timestamps: true }
);

export default Banner;
