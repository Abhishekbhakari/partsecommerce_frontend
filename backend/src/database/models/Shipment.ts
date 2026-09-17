import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

export type ShipmentStatus =
    | 'pending'
    | 'picked_up'
    | 'in_transit'
    | 'out_for_delivery'
    | 'delivered'
    | 'failed';

export interface TrackingEvent {
    status: ShipmentStatus;
    timestamp: string;
    location?: string;
}

export interface ShipmentAttributes {
    id: number;
    orderId: number;
    sellerId: number;
    carrier: string;
    awbNumber: string | null;
    status: ShipmentStatus;
    trackingHistory: TrackingEvent[];
    estimatedDelivery: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export type ShipmentCreationAttributes = Optional<
    ShipmentAttributes,
    'id' | 'awbNumber' | 'status' | 'trackingHistory' | 'estimatedDelivery' | 'createdAt' | 'updatedAt'
>;

export class Shipment
    extends Model<ShipmentAttributes, ShipmentCreationAttributes>
    implements ShipmentAttributes
{
    declare id: number;
    declare orderId: number;
    declare sellerId: number;
    declare carrier: string;
    declare awbNumber: string | null;
    declare status: ShipmentStatus;
    declare trackingHistory: TrackingEvent[];
    declare estimatedDelivery: Date | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Shipment.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        orderId: { type: DataTypes.INTEGER, allowNull: false },
        sellerId: { type: DataTypes.INTEGER, allowNull: false },
        carrier: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Shiprocket' },
        awbNumber: { type: DataTypes.STRING, allowNull: true },
        status: {
            type: DataTypes.ENUM(
                'pending',
                'picked_up',
                'in_transit',
                'out_for_delivery',
                'delivered',
                'failed'
            ),
            allowNull: false,
            defaultValue: 'pending'
        },
        trackingHistory: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
        estimatedDelivery: { type: DataTypes.DATE, allowNull: true }
    },
    { sequelize, tableName: 'shipments', modelName: 'Shipment', timestamps: true }
);

export default Shipment;
