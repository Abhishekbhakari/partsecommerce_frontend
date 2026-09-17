import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

export interface SettingsAttributes {
    id: number;
    key: string;
    value: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export type SettingsCreationAttributes = Optional<SettingsAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class Settings extends Model<SettingsAttributes, SettingsCreationAttributes> implements SettingsAttributes {
    declare id: number;
    declare key: string;
    declare value: string;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Settings.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        key: { type: DataTypes.STRING, allowNull: false, unique: true },
        value: { type: DataTypes.STRING, allowNull: false }
    },
    { sequelize, tableName: 'settings', modelName: 'Settings', timestamps: true }
);

export default Settings;
