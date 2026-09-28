'use strict';

/**
 * Inputs needed to price shipping from a courier (Shiprocket etc.) instead of a flat fee:
 *  - product_variants: parcel dimensions (weightGrams already exists) — couriers bill on the
 *    larger of dead weight and volumetric weight (L x W x H / 5000), so weight alone isn't enough.
 *  - sellers.pickupAddress: where the courier collects from. Shipping is priced per seller
 *    (each seller ships their own parcel from their own location).
 *  - orders.shippingBreakdown: the per-seller quote that was charged, snapshotted at checkout so
 *    the buyer/admin can see it later and a rate change never rewrites history.
 *
 * All nullable: existing products/sellers/orders keep working and fall back to defaults.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        const { DataTypes } = Sequelize;
        await queryInterface.addColumn('product_variants', 'lengthCm', { type: DataTypes.INTEGER, allowNull: true });
        await queryInterface.addColumn('product_variants', 'widthCm', { type: DataTypes.INTEGER, allowNull: true });
        await queryInterface.addColumn('product_variants', 'heightCm', { type: DataTypes.INTEGER, allowNull: true });
        await queryInterface.addColumn('sellers', 'pickupAddress', { type: DataTypes.JSONB, allowNull: true });
        await queryInterface.addColumn('orders', 'shippingBreakdown', { type: DataTypes.JSONB, allowNull: true });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('orders', 'shippingBreakdown');
        await queryInterface.removeColumn('sellers', 'pickupAddress');
        await queryInterface.removeColumn('product_variants', 'heightCm');
        await queryInterface.removeColumn('product_variants', 'widthCm');
        await queryInterface.removeColumn('product_variants', 'lengthCm');
    }
};
