import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

export interface ShipmentItemAttributes {
    id: number;
    shipmentId: number;
    orderItemId: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export type ShipmentItemCreationAttributes = Optional<ShipmentItemAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class ShipmentItem
    extends Model<ShipmentItemAttributes, ShipmentItemCreationAttributes>
    implements ShipmentItemAttributes
{
    declare id: number;
    declare shipmentId: number;
    declare orderItemId: number;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

ShipmentItem.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        shipmentId: { type: DataTypes.INTEGER, allowNull: false },
        orderItemId: { type: DataTypes.INTEGER, allowNull: false }
    },
    { sequelize, tableName: 'shipment_items', modelName: 'ShipmentItem', timestamps: true }
);

export default ShipmentItem;
