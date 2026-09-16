import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

export interface FitmentCompatibilityAttributes {
    id: number;
    productId: number;
    make: string;
    model: string;
    yearFrom: number;
    yearTo: number;
    variant: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export type FitmentCompatibilityCreationAttributes = Optional<
    FitmentCompatibilityAttributes,
    'id' | 'variant' | 'createdAt' | 'updatedAt'
>;

export class FitmentCompatibility
    extends Model<FitmentCompatibilityAttributes, FitmentCompatibilityCreationAttributes>
    implements FitmentCompatibilityAttributes
{
    declare id: number;
    declare productId: number;
    declare make: string;
    declare model: string;
    declare yearFrom: number;
    declare yearTo: number;
    declare variant: string | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

FitmentCompatibility.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        productId: { type: DataTypes.INTEGER, allowNull: false },
        make: { type: DataTypes.STRING, allowNull: false },
        model: { type: DataTypes.STRING, allowNull: false },
        yearFrom: { type: DataTypes.INTEGER, allowNull: false },
        yearTo: { type: DataTypes.INTEGER, allowNull: false },
        variant: { type: DataTypes.STRING, allowNull: true }
    },
    {
        sequelize,
        tableName: 'fitment_compatibilities',
        modelName: 'FitmentCompatibility',
        timestamps: true,
        indexes: [{ fields: ['make', 'model', 'yearFrom', 'yearTo'] }]
    }
);

export default FitmentCompatibility;
