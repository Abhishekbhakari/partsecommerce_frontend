import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

export interface CartItemAttributes {
    id: number;
    cartId: number;
    variantId: number;
    qty: number;
    priceAtAdd: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export type CartItemCreationAttributes = Optional<
    CartItemAttributes,
    'id' | 'createdAt' | 'updatedAt'
>;

export class CartItem
    extends Model<CartItemAttributes, CartItemCreationAttributes>
    implements CartItemAttributes
{
    declare id: number;
    declare cartId: number;
    declare variantId: number;
    declare qty: number;
    declare priceAtAdd: number;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

CartItem.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        cartId: { type: DataTypes.INTEGER, allowNull: false },
        variantId: { type: DataTypes.INTEGER, allowNull: false },
        qty: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        priceAtAdd: { type: DataTypes.INTEGER, allowNull: false }
    },
    { sequelize, tableName: 'cart_items', modelName: 'CartItem', timestamps: true }
);

export default CartItem;
