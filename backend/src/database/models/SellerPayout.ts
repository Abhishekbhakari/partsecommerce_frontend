import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

export type SellerPayoutStatus = 'pending' | 'paid';

export interface SellerPayoutAttributes {
    id: number;
    sellerId: number;
    periodStart: string;
    periodEnd: string;
    grossSales: number;
    commissionDeducted: number;
    netPayable: number;
    status: SellerPayoutStatus;
    paidAt: Date | null;
    notes: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export type SellerPayoutCreationAttributes = Optional<
    SellerPayoutAttributes,
    'id' | 'status' | 'paidAt' | 'notes' | 'createdAt' | 'updatedAt'
>;

export class SellerPayout
    extends Model<SellerPayoutAttributes, SellerPayoutCreationAttributes>
    implements SellerPayoutAttributes
{
    declare id: number;
    declare sellerId: number;
    declare periodStart: string;
    declare periodEnd: string;
    declare grossSales: number;
    declare commissionDeducted: number;
    declare netPayable: number;
    declare status: SellerPayoutStatus;
    declare paidAt: Date | null;
    declare notes: string | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

SellerPayout.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        sellerId: { type: DataTypes.INTEGER, allowNull: false },
        periodStart: { type: DataTypes.DATEONLY, allowNull: false },
        periodEnd: { type: DataTypes.DATEONLY, allowNull: false },
        grossSales: { type: DataTypes.INTEGER, allowNull: false },
        commissionDeducted: { type: DataTypes.INTEGER, allowNull: false },
        netPayable: { type: DataTypes.INTEGER, allowNull: false },
        status: { type: DataTypes.ENUM('pending', 'paid'), allowNull: false, defaultValue: 'pending' },
        paidAt: { type: DataTypes.DATE, allowNull: true },
        notes: { type: DataTypes.STRING, allowNull: true }
    },
    { sequelize, tableName: 'seller_payouts', modelName: 'SellerPayout', timestamps: true }
);

export default SellerPayout;
