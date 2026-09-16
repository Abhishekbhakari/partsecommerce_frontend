import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

/** User <-> Product many-to-many join table (see DATA_MODEL.md `User` relationships). */
export interface WishlistAttributes {
    id: number;
    userId: number;
    productId: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export type WishlistCreationAttributes = Optional<
    WishlistAttributes,
    'id' | 'createdAt' | 'updatedAt'
>;

export class Wishlist
    extends Model<WishlistAttributes, WishlistCreationAttributes>
    implements WishlistAttributes
{
    declare id: number;
    declare userId: number;
    declare productId: number;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Wishlist.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        userId: { type: DataTypes.INTEGER, allowNull: false },
        productId: { type: DataTypes.INTEGER, allowNull: false }
    },
    {
        sequelize,
        tableName: 'wishlists',
        modelName: 'Wishlist',
        timestamps: true,
        indexes: [{ unique: true, fields: ['userId', 'productId'] }]
    }
);

export default Wishlist;
