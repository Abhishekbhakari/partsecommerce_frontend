import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

export type ProductStatus = 'draft' | 'active' | 'archived';

export interface ProductAttributes {
    id: number;
    sku: string;
    title: string;
    slug: string;
    description: string | null;
    categoryId: number;
    brandId: number;
    sellerId: number;
    partNumber: string | null;
    oemNumber: string | null;
    basePrice: number;
    gstRate: number;
    images: string[];
    status: ProductStatus;
    avgRating: number;
    reviewCount: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export type ProductCreationAttributes = Optional<
    ProductAttributes,
    | 'id'
    | 'description'
    | 'partNumber'
    | 'oemNumber'
    | 'images'
    | 'status'
    | 'avgRating'
    | 'reviewCount'
    | 'createdAt'
    | 'updatedAt'
>;

export class Product
    extends Model<ProductAttributes, ProductCreationAttributes>
    implements ProductAttributes
{
    declare id: number;
    declare sku: string;
    declare title: string;
    declare slug: string;
    declare description: string | null;
    declare categoryId: number;
    declare brandId: number;
    declare sellerId: number;
    declare partNumber: string | null;
    declare oemNumber: string | null;
    declare basePrice: number;
    declare gstRate: number;
    declare images: string[];
    declare status: ProductStatus;
    declare avgRating: number;
    declare reviewCount: number;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Product.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        sku: { type: DataTypes.STRING, allowNull: false, unique: true },
        title: { type: DataTypes.STRING, allowNull: false },
        slug: { type: DataTypes.STRING, allowNull: false, unique: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        categoryId: { type: DataTypes.INTEGER, allowNull: false },
        brandId: { type: DataTypes.INTEGER, allowNull: false },
        sellerId: { type: DataTypes.INTEGER, allowNull: false },
        partNumber: { type: DataTypes.STRING, allowNull: true },
        oemNumber: { type: DataTypes.STRING, allowNull: true },
        basePrice: { type: DataTypes.INTEGER, allowNull: false },
        gstRate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 18 },
        images: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
        status: {
            type: DataTypes.ENUM('draft', 'active', 'archived'),
            allowNull: false,
            defaultValue: 'draft'
        },
        avgRating: { type: DataTypes.DECIMAL(3, 2), allowNull: false, defaultValue: 0 },
        reviewCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
    },
    {
        sequelize,
        tableName: 'products',
        modelName: 'Product',
        timestamps: true,
        indexes: [
            { fields: ['partNumber'] },
            { fields: ['oemNumber'] },
            { fields: ['categoryId'] },
            { fields: ['brandId'] },
            { fields: ['sellerId'] }
        ]
    }
);

export default Product;
