import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

export interface BrandAttributes {
    id: number;
    name: string;
    slug: string;
    logoUrl: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export type BrandCreationAttributes = Optional<
    BrandAttributes,
    'id' | 'logoUrl' | 'createdAt' | 'updatedAt'
>;

export class Brand
    extends Model<BrandAttributes, BrandCreationAttributes>
    implements BrandAttributes
{
    declare id: number;
    declare name: string;
    declare slug: string;
    declare logoUrl: string | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Brand.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        slug: { type: DataTypes.STRING, allowNull: false, unique: true },
        logoUrl: { type: DataTypes.STRING, allowNull: true }
    },
    { sequelize, tableName: 'brands', modelName: 'Brand', timestamps: true }
);

export default Brand;
