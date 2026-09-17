import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';
import { ShipmentStatus } from './Shipment';

export interface OrderItemAttributes {
    id: number;
    orderId: number;
    variantId: number;
    sellerId: number;
    productTitleSnapshot: string;
    qty: number;
    unitPrice: number;
    gstRateSnapshot: number;
    commissionRate: number;
    commissionAmount: number;
    sellerEarning: number;
    fulfillmentStatus: ShipmentStatus;
    createdAt?: Date;
    updatedAt?: Date;
}

export type OrderItemCreationAttributes = Optional<
    OrderItemAttributes,
    'id' | 'fulfillmentStatus' | 'createdAt' | 'updatedAt'
>;

export class OrderItem
    extends Model<OrderItemAttributes, OrderItemCreationAttributes>
    implements OrderItemAttributes
{
    declare id: number;
    declare orderId: number;
    declare variantId: number;
    declare sellerId: number;
    declare productTitleSnapshot: string;
    declare qty: number;
    declare unitPrice: number;
    declare gstRateSnapshot: number;
    declare commissionRate: number;
    declare commissionAmount: number;
    declare sellerEarning: number;
    declare fulfillmentStatus: ShipmentStatus;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

OrderItem.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        orderId: { type: DataTypes.INTEGER, allowNull: false },
        variantId: { type: DataTypes.INTEGER, allowNull: false },
        sellerId: { type: DataTypes.INTEGER, allowNull: false },
        productTitleSnapshot: { type: DataTypes.STRING, allowNull: false },
        qty: { type: DataTypes.INTEGER, allowNull: false },
        unitPrice: { type: DataTypes.INTEGER, allowNull: false },
        gstRateSnapshot: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
        commissionRate: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
        commissionAmount: { type: DataTypes.INTEGER, allowNull: false },
        sellerEarning: { type: DataTypes.INTEGER, allowNull: false },
        fulfillmentStatus: {
            type: DataTypes.ENUM('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed'),
            allowNull: false,
            defaultValue: 'pending'
        }
    },
    { sequelize, tableName: 'order_items', modelName: 'OrderItem', timestamps: true }
);

export default OrderItem;
