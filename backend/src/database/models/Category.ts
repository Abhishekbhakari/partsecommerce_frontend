import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

export interface CategoryAttributes {
    id: number;
    name: string;
    slug: string;
    parentId: number | null;
    imageUrl: string | null;
    sortOrder: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export type CategoryCreationAttributes = Optional<
    CategoryAttributes,
    'id' | 'parentId' | 'imageUrl' | 'sortOrder' | 'createdAt' | 'updatedAt'
>;

export class Category
    extends Model<CategoryAttributes, CategoryCreationAttributes>
    implements CategoryAttributes
{
    declare id: number;
    declare name: string;
    declare slug: string;
    declare parentId: number | null;
    declare imageUrl: string | null;
    declare sortOrder: number;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Category.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        slug: { type: DataTypes.STRING, allowNull: false, unique: true },
        parentId: { type: DataTypes.INTEGER, allowNull: true },
        imageUrl: { type: DataTypes.STRING, allowNull: true },
        sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
    },
    { sequelize, tableName: 'categories', modelName: 'Category', timestamps: true }
);

export default Category;
