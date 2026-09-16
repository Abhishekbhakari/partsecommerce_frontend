import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

export type CouponType = 'percentage' | 'flat';

export interface CouponAttributes {
    id: number;
    code: string;
    type: CouponType;
    value: number;
    minOrderValue: number | null;
    maxDiscount: number | null;
    validFrom: Date;
    validTo: Date;
    usageLimit: number | null;
    perUserLimit: number | null;
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export type CouponCreationAttributes = Optional<
    CouponAttributes,
    | 'id'
    | 'minOrderValue'
    | 'maxDiscount'
    | 'usageLimit'
    | 'perUserLimit'
    | 'active'
    | 'createdAt'
    | 'updatedAt'
>;

export class Coupon
    extends Model<CouponAttributes, CouponCreationAttributes>
    implements CouponAttributes
{
    declare id: number;
    declare code: string;
    declare type: CouponType;
    declare value: number;
    declare minOrderValue: number | null;
    declare maxDiscount: number | null;
    declare validFrom: Date;
    declare validTo: Date;
    declare usageLimit: number | null;
    declare perUserLimit: number | null;
    declare active: boolean;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Coupon.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        code: { type: DataTypes.STRING, allowNull: false, unique: true },
        type: { type: DataTypes.ENUM('percentage', 'flat'), allowNull: false },
        value: { type: DataTypes.INTEGER, allowNull: false },
        minOrderValue: { type: DataTypes.INTEGER, allowNull: true },
        maxDiscount: { type: DataTypes.INTEGER, allowNull: true },
        validFrom: { type: DataTypes.DATE, allowNull: false },
        validTo: { type: DataTypes.DATE, allowNull: false },
        usageLimit: { type: DataTypes.INTEGER, allowNull: true },
        perUserLimit: { type: DataTypes.INTEGER, allowNull: true },
        active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    },
    { sequelize, tableName: 'coupons', modelName: 'Coupon', timestamps: true }
);

export default Coupon;
