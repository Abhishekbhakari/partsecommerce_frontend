import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

export interface OrderItemAttributes {
    id: number;
    orderId: number;
    variantId: number;
    productTitleSnapshot: string;
    qty: number;
    unitPrice: number;
    gstRateSnapshot: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export type OrderItemCreationAttributes = Optional<
    OrderItemAttributes,
    'id' | 'createdAt' | 'updatedAt'
>;

export class OrderItem
    extends Model<OrderItemAttributes, OrderItemCreationAttributes>
    implements OrderItemAttributes
{
    declare id: number;
    declare orderId: number;
    declare variantId: number;
    declare productTitleSnapshot: string;
    declare qty: number;
    declare unitPrice: number;
    declare gstRateSnapshot: number;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

OrderItem.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        orderId: { type: DataTypes.INTEGER, allowNull: false },
        variantId: { type: DataTypes.INTEGER, allowNull: false },
        productTitleSnapshot: { type: DataTypes.STRING, allowNull: false },
        qty: { type: DataTypes.INTEGER, allowNull: false },
        unitPrice: { type: DataTypes.INTEGER, allowNull: false },
        gstRateSnapshot: { type: DataTypes.DECIMAL(5, 2), allowNull: false }
    },
    { sequelize, tableName: 'order_items', modelName: 'OrderItem', timestamps: true }
);

export default OrderItem;
