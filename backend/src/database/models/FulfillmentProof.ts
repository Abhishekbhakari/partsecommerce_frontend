import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

export type ProofStage = 'dispatch' | 'delivery';

export interface FulfillmentProofAttributes {
    id: number;
    orderItemId: number;
    sellerId: number;
    stage: ProofStage;
    imageUrls: string[];
    note: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export type FulfillmentProofCreationAttributes = Optional<
    FulfillmentProofAttributes,
    'id' | 'note' | 'createdAt' | 'updatedAt'
>;

export class FulfillmentProof
    extends Model<FulfillmentProofAttributes, FulfillmentProofCreationAttributes>
    implements FulfillmentProofAttributes
{
    declare id: number;
    declare orderItemId: number;
    declare sellerId: number;
    declare stage: ProofStage;
    declare imageUrls: string[];
    declare note: string | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

FulfillmentProof.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        orderItemId: { type: DataTypes.INTEGER, allowNull: false },
        sellerId: { type: DataTypes.INTEGER, allowNull: false },
        stage: { type: DataTypes.ENUM('dispatch', 'delivery'), allowNull: false },
        imageUrls: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
        note: { type: DataTypes.STRING(500), allowNull: true }
    },
    { sequelize, tableName: 'fulfillment_proofs', modelName: 'FulfillmentProof', timestamps: true }
);

export default FulfillmentProof;
