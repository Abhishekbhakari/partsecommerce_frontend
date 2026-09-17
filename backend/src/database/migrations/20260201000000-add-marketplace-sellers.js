'use strict';

/**
 * Phase 3 — multi-vendor marketplace.
 * Adds sellers, seller_payouts, settings, shipment_items tables and sellerId/commission
 * columns to products/order_items/shipments. Follows the nullable -> backfill -> NOT NULL
 * sequence within this single migration so the DB is never left in an invalid state.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        const { DataTypes } = Sequelize;
        const timestamps = {
            createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
            updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
        };

        const DEFAULT_COMMISSION_RATE = 10; // percent

        /* ---- 1. sellers ---- */
        await queryInterface.createTable('sellers', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            businessName: { type: DataTypes.STRING, allowNull: false },
            email: { type: DataTypes.STRING, allowNull: false, unique: true },
            passwordHash: { type: DataTypes.STRING, allowNull: false },
            phone: { type: DataTypes.STRING, allowNull: false },
            gstNumber: { type: DataTypes.STRING, allowNull: true },
            status: {
                type: DataTypes.ENUM('pending', 'approved', 'rejected', 'suspended'),
                allowNull: false,
                defaultValue: 'pending'
            },
            commissionRateOverride: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
            payoutBankDetails: { type: DataTypes.JSONB, allowNull: true },
            rejectionReason: { type: DataTypes.STRING, allowNull: true },
            approvedAt: { type: DataTypes.DATE, allowNull: true },
            ...timestamps
        });

        /* ---- 2. seller_payouts ---- */
        await queryInterface.createTable('seller_payouts', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            sellerId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'sellers', key: 'id' },
                onDelete: 'CASCADE'
            },
            periodStart: { type: DataTypes.DATEONLY, allowNull: false },
            periodEnd: { type: DataTypes.DATEONLY, allowNull: false },
            grossSales: { type: DataTypes.INTEGER, allowNull: false },
            commissionDeducted: { type: DataTypes.INTEGER, allowNull: false },
            netPayable: { type: DataTypes.INTEGER, allowNull: false },
            status: { type: DataTypes.ENUM('pending', 'paid'), allowNull: false, defaultValue: 'pending' },
            paidAt: { type: DataTypes.DATE, allowNull: true },
            notes: { type: DataTypes.STRING, allowNull: true },
            ...timestamps
        });
        await queryInterface.addIndex('seller_payouts', ['sellerId']);

        /* ---- 3. settings (generic key-value; none existed before) ---- */
        await queryInterface.createTable('settings', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            key: { type: DataTypes.STRING, allowNull: false, unique: true },
            value: { type: DataTypes.STRING, allowNull: false },
            ...timestamps
        });
        await queryInterface.bulkInsert('settings', [
            {
                key: 'platform_commission_rate_percent',
                value: String(DEFAULT_COMMISSION_RATE),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);

        /* ---- Seed the system seller (migrates "we sell our own stock" to seller #1) ---- */
        await queryInterface.bulkInsert('sellers', [
            {
                businessName: 'PartsHub Direct',
                email: 'system-seller@spareparts.local',
                passwordHash: '$2a$10$invalidPlaceholderHashNotAUsableLoginXXXXXXXXXXXXXXXX',
                phone: '0000000000',
                gstNumber: null,
                status: 'approved',
                commissionRateOverride: null,
                payoutBankDetails: null,
                rejectionReason: null,
                approvedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
        const [[{ id: systemSellerId }]] = await queryInterface.sequelize.query(
            `SELECT id FROM sellers WHERE email = 'system-seller@spareparts.local' LIMIT 1;`
        );

        /* ---- 4. products.sellerId — nullable -> backfill -> NOT NULL ---- */
        await queryInterface.addColumn('products', 'sellerId', {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'sellers', key: 'id' },
            onDelete: 'RESTRICT'
        });
        await queryInterface.sequelize.query(
            `UPDATE products SET "sellerId" = ${systemSellerId} WHERE "sellerId" IS NULL;`
        );
        await queryInterface.changeColumn('products', 'sellerId', {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'sellers', key: 'id' },
            onDelete: 'RESTRICT'
        });
        await queryInterface.addIndex('products', ['sellerId']);

        /* ---- 5. order_items — sellerId + commission snapshot fields ---- */
        await queryInterface.addColumn('order_items', 'sellerId', {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'sellers', key: 'id' },
            onDelete: 'RESTRICT'
        });
        await queryInterface.addColumn('order_items', 'commissionRate', {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true
        });
        await queryInterface.addColumn('order_items', 'commissionAmount', {
            type: DataTypes.INTEGER,
            allowNull: true
        });
        await queryInterface.addColumn('order_items', 'sellerEarning', {
            type: DataTypes.INTEGER,
            allowNull: true
        });
        await queryInterface.addColumn('order_items', 'fulfillmentStatus', {
            type: DataTypes.ENUM('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed'),
            allowNull: false,
            defaultValue: 'pending'
        });

        // Backfill: every existing order item's product is now owned by the system seller
        // (backfilled above), and no per-seller override existed at that time, so the platform
        // default rate applies. commissionAmount/sellerEarning computed from qty*unitPrice.
        await queryInterface.sequelize.query(`
            UPDATE order_items
            SET "sellerId" = ${systemSellerId},
                "commissionRate" = ${DEFAULT_COMMISSION_RATE},
                "commissionAmount" = ROUND(qty * "unitPrice" * ${DEFAULT_COMMISSION_RATE} / 100.0),
                "sellerEarning" = (qty * "unitPrice") - ROUND(qty * "unitPrice" * ${DEFAULT_COMMISSION_RATE} / 100.0)
            WHERE "sellerId" IS NULL;
        `);

        await queryInterface.changeColumn('order_items', 'sellerId', {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'sellers', key: 'id' },
            onDelete: 'RESTRICT'
        });
        await queryInterface.changeColumn('order_items', 'commissionRate', {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false
        });
        await queryInterface.changeColumn('order_items', 'commissionAmount', {
            type: DataTypes.INTEGER,
            allowNull: false
        });
        await queryInterface.changeColumn('order_items', 'sellerEarning', {
            type: DataTypes.INTEGER,
            allowNull: false
        });
        await queryInterface.addIndex('order_items', ['sellerId']);

        /* ---- 6. shipments.sellerId — nullable -> backfill -> NOT NULL ---- */
        await queryInterface.addColumn('shipments', 'sellerId', {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'sellers', key: 'id' },
            onDelete: 'RESTRICT'
        });
        await queryInterface.sequelize.query(
            `UPDATE shipments SET "sellerId" = ${systemSellerId} WHERE "sellerId" IS NULL;`
        );
        await queryInterface.changeColumn('shipments', 'sellerId', {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'sellers', key: 'id' },
            onDelete: 'RESTRICT'
        });
        await queryInterface.addIndex('shipments', ['sellerId']);

        /* ---- 7. shipment_items — maps a shipment to the specific order_items it covers ---- */
        await queryInterface.createTable('shipment_items', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            shipmentId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'shipments', key: 'id' },
                onDelete: 'CASCADE'
            },
            orderItemId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'order_items', key: 'id' },
                onDelete: 'CASCADE'
            },
            ...timestamps
        });
        await queryInterface.addIndex('shipment_items', ['shipmentId']);
        await queryInterface.addIndex('shipment_items', ['orderItemId'], { unique: true });

        // Backfill: every pre-existing shipment covered its whole (single-seller) order.
        await queryInterface.sequelize.query(`
            INSERT INTO shipment_items ("shipmentId", "orderItemId", "createdAt", "updatedAt")
            SELECT s.id, oi.id, NOW(), NOW()
            FROM shipments s
            JOIN order_items oi ON oi."orderId" = s."orderId"
            ON CONFLICT DO NOTHING;
        `);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('shipment_items');

        await queryInterface.removeColumn('shipments', 'sellerId');

        await queryInterface.removeColumn('order_items', 'fulfillmentStatus');
        await queryInterface.removeColumn('order_items', 'sellerEarning');
        await queryInterface.removeColumn('order_items', 'commissionAmount');
        await queryInterface.removeColumn('order_items', 'commissionRate');
        await queryInterface.removeColumn('order_items', 'sellerId');

        await queryInterface.removeColumn('products', 'sellerId');

        await queryInterface.dropTable('settings');
        await queryInterface.dropTable('seller_payouts');
        await queryInterface.dropTable('sellers');

        const dropEnum = async (name) => {
            await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${name}";`);
        };
        await Promise.all(
            ['enum_sellers_status', 'enum_seller_payouts_status', 'enum_order_items_fulfillmentStatus'].map(dropEnum)
        );
    }
};
