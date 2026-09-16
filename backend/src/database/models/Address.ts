import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

export interface AddressAttributes {
    id: number;
    userId: number | null;
    label: string | null;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    pincode: string;
    country: string;
    phone: string;
    isDefault: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export type AddressCreationAttributes = Optional<
    AddressAttributes,
    'id' | 'userId' | 'label' | 'line2' | 'country' | 'isDefault' | 'createdAt' | 'updatedAt'
>;

export class Address
    extends Model<AddressAttributes, AddressCreationAttributes>
    implements AddressAttributes
{
    declare id: number;
    declare userId: number | null;
    declare label: string | null;
    declare line1: string;
    declare line2: string | null;
    declare city: string;
    declare state: string;
    declare pincode: string;
    declare country: string;
    declare phone: string;
    declare isDefault: boolean;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Address.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        userId: { type: DataTypes.INTEGER, allowNull: true },
        label: { type: DataTypes.STRING, allowNull: true },
        line1: { type: DataTypes.STRING, allowNull: false },
        line2: { type: DataTypes.STRING, allowNull: true },
        city: { type: DataTypes.STRING, allowNull: false },
        state: { type: DataTypes.STRING, allowNull: false },
        pincode: { type: DataTypes.STRING, allowNull: false },
        country: { type: DataTypes.STRING, allowNull: false, defaultValue: 'IN' },
        phone: { type: DataTypes.STRING, allowNull: false },
        isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    },
    { sequelize, tableName: 'addresses', modelName: 'Address', timestamps: true }
);

export default Address;
