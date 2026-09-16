import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

export type PaymentGateway = 'razorpay' | 'cod';
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';
export type PaymentStatus = 'initiated' | 'captured' | 'failed' | 'refunded' | 'partially_refunded';

export interface PaymentAttributes {
    id: number;
    orderId: number;
    gateway: PaymentGateway;
    gatewayOrderId: string | null;
    gatewayPaymentId: string | null;
    method: PaymentMethod;
    amount: number;
    status: PaymentStatus;
    refundedAmount: number;
    rawWebhookPayload: Record<string, unknown> | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export type PaymentCreationAttributes = Optional<
    PaymentAttributes,
    | 'id'
    | 'gatewayOrderId'
    | 'gatewayPaymentId'
    | 'status'
    | 'refundedAmount'
    | 'rawWebhookPayload'
    | 'createdAt'
    | 'updatedAt'
>;

export class Payment
    extends Model<PaymentAttributes, PaymentCreationAttributes>
    implements PaymentAttributes
{
    declare id: number;
    declare orderId: number;
    declare gateway: PaymentGateway;
    declare gatewayOrderId: string | null;
    declare gatewayPaymentId: string | null;
    declare method: PaymentMethod;
    declare amount: number;
    declare status: PaymentStatus;
    declare refundedAmount: number;
    declare rawWebhookPayload: Record<string, unknown> | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Payment.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        orderId: { type: DataTypes.INTEGER, allowNull: false },
        gateway: { type: DataTypes.ENUM('razorpay', 'cod'), allowNull: false },
        gatewayOrderId: { type: DataTypes.STRING, allowNull: true },
        gatewayPaymentId: { type: DataTypes.STRING, allowNull: true },
        method: {
            type: DataTypes.ENUM('upi', 'card', 'netbanking', 'wallet', 'cod'),
            allowNull: false
        },
        amount: { type: DataTypes.INTEGER, allowNull: false },
        status: {
            type: DataTypes.ENUM('initiated', 'captured', 'failed', 'refunded', 'partially_refunded'),
            allowNull: false,
            defaultValue: 'initiated'
        },
        refundedAmount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        rawWebhookPayload: { type: DataTypes.JSONB, allowNull: true }
    },
    { sequelize, tableName: 'payments', modelName: 'Payment', timestamps: true }
);

export default Payment;
