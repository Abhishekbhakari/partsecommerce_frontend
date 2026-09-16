import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

export type NotificationChannel = 'email' | 'sms' | 'whatsapp' | 'in_app';
export type NotificationStatus = 'queued' | 'sent' | 'failed';

export interface NotificationAttributes {
    id: number;
    userId: number | null;
    channel: NotificationChannel;
    type: string;
    payload: Record<string, unknown>;
    status: NotificationStatus;
    readAt: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export type NotificationCreationAttributes = Optional<
    NotificationAttributes,
    'id' | 'userId' | 'status' | 'readAt' | 'createdAt' | 'updatedAt'
>;

export class Notification
    extends Model<NotificationAttributes, NotificationCreationAttributes>
    implements NotificationAttributes
{
    declare id: number;
    declare userId: number | null;
    declare channel: NotificationChannel;
    declare type: string;
    declare payload: Record<string, unknown>;
    declare status: NotificationStatus;
    declare readAt: Date | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Notification.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        userId: { type: DataTypes.INTEGER, allowNull: true },
        channel: {
            type: DataTypes.ENUM('email', 'sms', 'whatsapp', 'in_app'),
            allowNull: false
        },
        type: { type: DataTypes.STRING, allowNull: false },
        payload: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
        status: {
            type: DataTypes.ENUM('queued', 'sent', 'failed'),
            allowNull: false,
            defaultValue: 'queued'
        },
        readAt: { type: DataTypes.DATE, allowNull: true }
    },
    { sequelize, tableName: 'notifications', modelName: 'Notification', timestamps: true }
);

export default Notification;
