import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

export type AdminRoleValue = 'owner' | 'manager' | 'catalog_editor' | 'order_manager' | 'support';

export interface AdminUserAttributes {
    id: number;
    name: string;
    email: string;
    passwordHash: string;
    role: AdminRoleValue;
    active: boolean;
    lastLoginAt: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export type AdminUserCreationAttributes = Optional<
    AdminUserAttributes,
    'id' | 'active' | 'lastLoginAt' | 'createdAt' | 'updatedAt'
>;

export class AdminUser
    extends Model<AdminUserAttributes, AdminUserCreationAttributes>
    implements AdminUserAttributes
{
    declare id: number;
    declare name: string;
    declare email: string;
    declare passwordHash: string;
    declare role: AdminRoleValue;
    declare active: boolean;
    declare lastLoginAt: Date | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

AdminUser.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        passwordHash: { type: DataTypes.STRING, allowNull: false },
        role: {
            type: DataTypes.ENUM('owner', 'manager', 'catalog_editor', 'order_manager', 'support'),
            allowNull: false,
            defaultValue: 'support'
        },
        active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        lastLoginAt: { type: DataTypes.DATE, allowNull: true }
    },
    { sequelize, tableName: 'admin_users', modelName: 'AdminUser', timestamps: true }
);

export default AdminUser;
