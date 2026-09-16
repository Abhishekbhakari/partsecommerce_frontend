import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

export interface CartAttributes {
    id: number;
    userId: number | null;
    sessionId: string | null;
    couponId: number | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export type CartCreationAttributes = Optional<
    CartAttributes,
    'id' | 'userId' | 'sessionId' | 'couponId' | 'createdAt' | 'updatedAt'
>;

export class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
    declare id: number;
    declare userId: number | null;
    declare sessionId: string | null;
    declare couponId: number | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Cart.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        userId: { type: DataTypes.INTEGER, allowNull: true },
        sessionId: { type: DataTypes.STRING, allowNull: true },
        couponId: { type: DataTypes.INTEGER, allowNull: true }
    },
    { sequelize, tableName: 'carts', modelName: 'Cart', timestamps: true }
);

export default Cart;
