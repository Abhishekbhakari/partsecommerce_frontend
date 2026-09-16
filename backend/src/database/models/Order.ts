import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'packed'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'returned';

export interface OrderAttributes {
    id: number;
    orderNumber: string;
    userId: number | null;
    guestEmail: string | null;
    status: OrderStatus;
    shippingAddress: Record<string, unknown>;
    subtotal: number;
    discount: number;
    shippingFee: number;
    gstAmount: number;
    total: number;
    couponId: number | null;
    placedAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export type OrderCreationAttributes = Optional<
    OrderAttributes,
    | 'id'
    | 'userId'
    | 'guestEmail'
    | 'status'
    | 'discount'
    | 'shippingFee'
    | 'couponId'
    | 'placedAt'
    | 'createdAt'
    | 'updatedAt'
>;

export class Order
    extends Model<OrderAttributes, OrderCreationAttributes>
    implements OrderAttributes
{
    declare id: number;
    declare orderNumber: string;
    declare userId: number | null;
    declare guestEmail: string | null;
    declare status: OrderStatus;
    declare shippingAddress: Record<string, unknown>;
    declare subtotal: number;
    declare discount: number;
    declare shippingFee: number;
    declare gstAmount: number;
    declare total: number;
    declare couponId: number | null;
    declare placedAt: Date;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Order.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        orderNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
        userId: { type: DataTypes.INTEGER, allowNull: true },
        guestEmail: { type: DataTypes.STRING, allowNull: true },
        status: {
            type: DataTypes.ENUM(
                'pending',
                'confirmed',
                'packed',
                'shipped',
                'delivered',
                'cancelled',
                'returned'
            ),
            allowNull: false,
            defaultValue: 'pending'
        },
        shippingAddress: { type: DataTypes.JSONB, allowNull: false },
        subtotal: { type: DataTypes.INTEGER, allowNull: false },
        discount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        shippingFee: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        gstAmount: { type: DataTypes.INTEGER, allowNull: false },
        total: { type: DataTypes.INTEGER, allowNull: false },
        couponId: { type: DataTypes.INTEGER, allowNull: true },
        placedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    },
    { sequelize, tableName: 'orders', modelName: 'Order', timestamps: true }
);

export default Order;
