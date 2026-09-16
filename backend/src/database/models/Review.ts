import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ReviewAttributes {
    id: number;
    productId: number;
    userId: number;
    orderItemId: number;
    rating: number;
    comment: string | null;
    status: ReviewStatus;
    createdAt?: Date;
    updatedAt?: Date;
}

export type ReviewCreationAttributes = Optional<
    ReviewAttributes,
    'id' | 'comment' | 'status' | 'createdAt' | 'updatedAt'
>;

export class Review
    extends Model<ReviewAttributes, ReviewCreationAttributes>
    implements ReviewAttributes
{
    declare id: number;
    declare productId: number;
    declare userId: number;
    declare orderItemId: number;
    declare rating: number;
    declare comment: string | null;
    declare status: ReviewStatus;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Review.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        productId: { type: DataTypes.INTEGER, allowNull: false },
        userId: { type: DataTypes.INTEGER, allowNull: false },
        orderItemId: { type: DataTypes.INTEGER, allowNull: false },
        rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
        comment: { type: DataTypes.TEXT, allowNull: true },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            allowNull: false,
            defaultValue: 'pending'
        }
    },
    { sequelize, tableName: 'reviews', modelName: 'Review', timestamps: true }
);

export default Review;
