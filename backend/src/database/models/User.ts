import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

export type AuthProvider = 'otp' | 'email' | 'google';

export interface UserAttributes {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    authProvider: AuthProvider;
    passwordHash: string | null;
    googleId: string | null;
    isVerified: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export type UserCreationAttributes = Optional<
    UserAttributes,
    'id' | 'email' | 'phone' | 'passwordHash' | 'googleId' | 'isVerified' | 'createdAt' | 'updatedAt'
>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    declare id: number;
    declare name: string;
    declare email: string | null;
    declare phone: string | null;
    declare authProvider: AuthProvider;
    declare passwordHash: string | null;
    declare googleId: string | null;
    declare isVerified: boolean;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

User.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: true, unique: true },
        phone: { type: DataTypes.STRING, allowNull: true, unique: true },
        authProvider: {
            type: DataTypes.ENUM('otp', 'email', 'google'),
            allowNull: false,
            defaultValue: 'otp'
        },
        passwordHash: { type: DataTypes.STRING, allowNull: true },
        googleId: { type: DataTypes.STRING, allowNull: true },
        isVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    },
    { sequelize, tableName: 'users', modelName: 'User', timestamps: true }
);

export default User;
