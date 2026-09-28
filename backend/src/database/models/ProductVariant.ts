import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../Common/database/config/sequelize';

export interface ProductVariantAttributes {
    id: number;
    productId: number;
    name: string;
    skuSuffix: string | null;
    priceDelta: number;
    stock: number;
    weightGrams: number | null;
    lengthCm: number | null;
    widthCm: number | null;
    heightCm: number | null;
    barcode: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export type ProductVariantCreationAttributes = Optional<
    ProductVariantAttributes,
    'id' | 'skuSuffix' | 'priceDelta' | 'stock' | 'weightGrams' | 'lengthCm' | 'widthCm' | 'heightCm' | 'barcode' | 'createdAt' | 'updatedAt'
>;

export class ProductVariant
    extends Model<ProductVariantAttributes, ProductVariantCreationAttributes>
    implements ProductVariantAttributes
{
    declare id: number;
    declare productId: number;
    declare name: string;
    declare skuSuffix: string | null;
    declare priceDelta: number;
    declare stock: number;
    declare weightGrams: number | null;
    declare lengthCm: number | null;
    declare widthCm: number | null;
    declare heightCm: number | null;
    declare barcode: string | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

ProductVariant.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        productId: { type: DataTypes.INTEGER, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        skuSuffix: { type: DataTypes.STRING, allowNull: true },
        priceDelta: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        weightGrams: { type: DataTypes.INTEGER, allowNull: true },
        lengthCm: { type: DataTypes.INTEGER, allowNull: true },
        widthCm: { type: DataTypes.INTEGER, allowNull: true },
        heightCm: { type: DataTypes.INTEGER, allowNull: true },
        barcode: { type: DataTypes.STRING, allowNull: true }
    },
    { sequelize, tableName: 'product_variants', modelName: 'ProductVariant', timestamps: true }
);

export default ProductVariant;
