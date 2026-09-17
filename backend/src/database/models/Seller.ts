import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

export type SellerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface SellerBankDetails {
    accountHolder?: string;
    accountNumber?: string;
    ifsc?: string;
}

export interface SellerAttributes {
    id: number;
    businessName: string;
    email: string;
    passwordHash: string;
    phone: string;
    gstNumber: string | null;
    status: SellerStatus;
    commissionRateOverride: number | null;
    payoutBankDetails: SellerBankDetails | null;
    rejectionReason: string | null;
    approvedAt: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export type SellerCreationAttributes = Optional<
    SellerAttributes,
    | 'id'
    | 'gstNumber'
    | 'status'
    | 'commissionRateOverride'
    | 'payoutBankDetails'
    | 'rejectionReason'
    | 'approvedAt'
    | 'createdAt'
    | 'updatedAt'
>;

export class Seller extends Model<SellerAttributes, SellerCreationAttributes> implements SellerAttributes {
    declare id: number;
    declare businessName: string;
    declare email: string;
    declare passwordHash: string;
    declare phone: string;
    declare gstNumber: string | null;
    declare status: SellerStatus;
    declare commissionRateOverride: number | null;
    declare payoutBankDetails: SellerBankDetails | null;
    declare rejectionReason: string | null;
    declare approvedAt: Date | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Seller.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        businessName: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        passwordHash: { type: DataTypes.STRING, allowNull: false },
        phone: { type: DataTypes.STRING, allowNull: false },
        gstNumber: { type: DataTypes.STRING, allowNull: true },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected', 'suspended'),
            allowNull: false,
            defaultValue: 'pending'
        },
        commissionRateOverride: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
        payoutBankDetails: { type: DataTypes.JSONB, allowNull: true },
        rejectionReason: { type: DataTypes.STRING, allowNull: true },
        approvedAt: { type: DataTypes.DATE, allowNull: true }
    },
    { sequelize, tableName: 'sellers', modelName: 'Seller', timestamps: true }
);

export default Seller;
