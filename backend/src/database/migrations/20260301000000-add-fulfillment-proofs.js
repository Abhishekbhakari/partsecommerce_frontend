'use strict';

/**
 * Proof-of-dispatch / proof-of-delivery photos. One row per (order item, stage) submission —
 * the server sets createdAt itself (never trusted from the client), which is what makes a
 * photo usable as evidence in a later dispute: it shows WHEN the seller claimed the state.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        const { DataTypes } = Sequelize;
        await queryInterface.createTable('fulfillment_proofs', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            orderItemId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'order_items', key: 'id' },
                onDelete: 'CASCADE'
            },
            sellerId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'sellers', key: 'id' }
            },
            stage: { type: DataTypes.ENUM('dispatch', 'delivery'), allowNull: false },
            imageUrls: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
            note: { type: DataTypes.STRING(500), allowNull: true },
            createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
            updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
        });
        await queryInterface.addIndex('fulfillment_proofs', ['orderItemId', 'stage']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('fulfillment_proofs');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_fulfillment_proofs_stage";');
    }
};
