import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

/** Backs POST /auth/otp/request + /auth/otp/verify. The SMS/email send itself is stubbed
 *  behind CustomerAccountManagement/services/OtpSender — this table just tracks state. */
export interface OtpRequestAttributes {
    id: number;
    requestId: string;
    identifier: string; // phone or email
    otpHash: string;
    expiresAt: Date;
    consumedAt: Date | null;
    attempts: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export type OtpRequestCreationAttributes = Optional<
    OtpRequestAttributes,
    'id' | 'consumedAt' | 'attempts' | 'createdAt' | 'updatedAt'
>;

export class OtpRequest
    extends Model<OtpRequestAttributes, OtpRequestCreationAttributes>
    implements OtpRequestAttributes
{
    declare id: number;
    declare requestId: string;
    declare identifier: string;
    declare otpHash: string;
    declare expiresAt: Date;
    declare consumedAt: Date | null;
    declare attempts: number;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

OtpRequest.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        requestId: { type: DataTypes.STRING, allowNull: false, unique: true },
        identifier: { type: DataTypes.STRING, allowNull: false },
        otpHash: { type: DataTypes.STRING, allowNull: false },
        expiresAt: { type: DataTypes.DATE, allowNull: false },
        consumedAt: { type: DataTypes.DATE, allowNull: true },
        attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
    },
    { sequelize, tableName: 'otp_requests', modelName: 'OtpRequest', timestamps: true }
);

export default OtpRequest;
