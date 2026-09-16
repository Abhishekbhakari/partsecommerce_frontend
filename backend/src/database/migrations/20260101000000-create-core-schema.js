'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const { DataTypes } = Sequelize;
        const timestamps = {
            createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
            updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
        };

        await queryInterface.createTable('users', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING, allowNull: false },
            email: { type: DataTypes.STRING, allowNull: true, unique: true },
            phone: { type: DataTypes.STRING, allowNull: true, unique: true },
            authProvider: { type: DataTypes.ENUM('otp', 'email', 'google'), allowNull: false, defaultValue: 'otp' },
            passwordHash: { type: DataTypes.STRING, allowNull: true },
            googleId: { type: DataTypes.STRING, allowNull: true },
            isVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            ...timestamps
        });

        await queryInterface.createTable('admin_users', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING, allowNull: false },
            email: { type: DataTypes.STRING, allowNull: false, unique: true },
            passwordHash: { type: DataTypes.STRING, allowNull: false },
            role: {
                type: DataTypes.ENUM('owner', 'manager', 'catalog_editor', 'order_manager', 'support'),
                allowNull: false,
                defaultValue: 'support'
            },
            active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            lastLoginAt: { type: DataTypes.DATE, allowNull: true },
            ...timestamps
        });

        await queryInterface.createTable('addresses', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: 'users', key: 'id' },
                onDelete: 'CASCADE'
            },
            label: { type: DataTypes.STRING, allowNull: true },
            line1: { type: DataTypes.STRING, allowNull: false },
            line2: { type: DataTypes.STRING, allowNull: true },
            city: { type: DataTypes.STRING, allowNull: false },
            state: { type: DataTypes.STRING, allowNull: false },
            pincode: { type: DataTypes.STRING, allowNull: false },
            country: { type: DataTypes.STRING, allowNull: false, defaultValue: 'IN' },
            phone: { type: DataTypes.STRING, allowNull: false },
            isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            ...timestamps
        });

        await queryInterface.createTable('categories', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING, allowNull: false },
            slug: { type: DataTypes.STRING, allowNull: false, unique: true },
            parentId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: 'categories', key: 'id' },
                onDelete: 'SET NULL'
            },
            imageUrl: { type: DataTypes.STRING, allowNull: true },
            sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            ...timestamps
        });

        await queryInterface.createTable('brands', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING, allowNull: false },
            slug: { type: DataTypes.STRING, allowNull: false, unique: true },
            logoUrl: { type: DataTypes.STRING, allowNull: true },
            ...timestamps
        });

        await queryInterface.createTable('products', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            sku: { type: DataTypes.STRING, allowNull: false, unique: true },
            title: { type: DataTypes.STRING, allowNull: false },
            slug: { type: DataTypes.STRING, allowNull: false, unique: true },
            description: { type: DataTypes.TEXT, allowNull: true },
            categoryId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'categories', key: 'id' },
                onDelete: 'RESTRICT'
            },
            brandId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'brands', key: 'id' },
                onDelete: 'RESTRICT'
            },
            partNumber: { type: DataTypes.STRING, allowNull: true },
            oemNumber: { type: DataTypes.STRING, allowNull: true },
            basePrice: { type: DataTypes.INTEGER, allowNull: false },
            gstRate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 18 },
            images: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
            status: { type: DataTypes.ENUM('draft', 'active', 'archived'), allowNull: false, defaultValue: 'draft' },
            avgRating: { type: DataTypes.DECIMAL(3, 2), allowNull: false, defaultValue: 0 },
            reviewCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            ...timestamps
        });
        await queryInterface.addIndex('products', ['partNumber']);
        await queryInterface.addIndex('products', ['oemNumber']);
        await queryInterface.addIndex('products', ['categoryId']);
        await queryInterface.addIndex('products', ['brandId']);

        await queryInterface.createTable('product_variants', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            productId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'products', key: 'id' },
                onDelete: 'CASCADE'
            },
            name: { type: DataTypes.STRING, allowNull: false },
            skuSuffix: { type: DataTypes.STRING, allowNull: true },
            priceDelta: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            weightGrams: { type: DataTypes.INTEGER, allowNull: true },
            barcode: { type: DataTypes.STRING, allowNull: true },
            ...timestamps
        });

        await queryInterface.createTable('fitment_compatibilities', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            productId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'products', key: 'id' },
                onDelete: 'CASCADE'
            },
            make: { type: DataTypes.STRING, allowNull: false },
            model: { type: DataTypes.STRING, allowNull: false },
            yearFrom: { type: DataTypes.INTEGER, allowNull: false },
            yearTo: { type: DataTypes.INTEGER, allowNull: false },
            variant: { type: DataTypes.STRING, allowNull: true },
            ...timestamps
        });
        await queryInterface.addIndex('fitment_compatibilities', ['make', 'model', 'yearFrom', 'yearTo']);

        await queryInterface.createTable('coupons', {
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
            active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            ...timestamps
        });

        await queryInterface.createTable('carts', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: 'users', key: 'id' },
                onDelete: 'CASCADE'
            },
            sessionId: { type: DataTypes.STRING, allowNull: true },
            couponId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: 'coupons', key: 'id' },
                onDelete: 'SET NULL'
            },
            ...timestamps
        });

        await queryInterface.createTable('cart_items', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            cartId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'carts', key: 'id' },
                onDelete: 'CASCADE'
            },
            variantId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'product_variants', key: 'id' },
                onDelete: 'CASCADE'
            },
            qty: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
            priceAtAdd: { type: DataTypes.INTEGER, allowNull: false },
            ...timestamps
        });

        await queryInterface.createTable('orders', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            orderNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: 'users', key: 'id' },
                onDelete: 'SET NULL'
            },
            guestEmail: { type: DataTypes.STRING, allowNull: true },
            status: {
                type: DataTypes.ENUM('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'),
                allowNull: false,
                defaultValue: 'pending'
            },
            shippingAddress: { type: DataTypes.JSONB, allowNull: false },
            subtotal: { type: DataTypes.INTEGER, allowNull: false },
            discount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            shippingFee: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            gstAmount: { type: DataTypes.INTEGER, allowNull: false },
            total: { type: DataTypes.INTEGER, allowNull: false },
            couponId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: 'coupons', key: 'id' },
                onDelete: 'SET NULL'
            },
            placedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
            ...timestamps
        });

        await queryInterface.createTable('order_items', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            orderId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'orders', key: 'id' },
                onDelete: 'CASCADE'
            },
            variantId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'product_variants', key: 'id' },
                onDelete: 'RESTRICT'
            },
            productTitleSnapshot: { type: DataTypes.STRING, allowNull: false },
            qty: { type: DataTypes.INTEGER, allowNull: false },
            unitPrice: { type: DataTypes.INTEGER, allowNull: false },
            gstRateSnapshot: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
            ...timestamps
        });

        await queryInterface.createTable('payments', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            orderId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'orders', key: 'id' },
                onDelete: 'CASCADE'
            },
            gateway: { type: DataTypes.ENUM('razorpay', 'cod'), allowNull: false },
            gatewayOrderId: { type: DataTypes.STRING, allowNull: true },
            gatewayPaymentId: { type: DataTypes.STRING, allowNull: true },
            method: { type: DataTypes.ENUM('upi', 'card', 'netbanking', 'wallet', 'cod'), allowNull: false },
            amount: { type: DataTypes.INTEGER, allowNull: false },
            status: {
                type: DataTypes.ENUM('initiated', 'captured', 'failed', 'refunded', 'partially_refunded'),
                allowNull: false,
                defaultValue: 'initiated'
            },
            refundedAmount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            rawWebhookPayload: { type: DataTypes.JSONB, allowNull: true },
            ...timestamps
        });

        await queryInterface.createTable('shipments', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            orderId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'orders', key: 'id' },
                onDelete: 'CASCADE'
            },
            carrier: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Shiprocket' },
            awbNumber: { type: DataTypes.STRING, allowNull: true },
            status: {
                type: DataTypes.ENUM('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed'),
                allowNull: false,
                defaultValue: 'pending'
            },
            trackingHistory: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
            estimatedDelivery: { type: DataTypes.DATE, allowNull: true },
            ...timestamps
        });

        await queryInterface.createTable('reviews', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            productId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'products', key: 'id' },
                onDelete: 'CASCADE'
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onDelete: 'CASCADE'
            },
            orderItemId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'order_items', key: 'id' },
                onDelete: 'CASCADE'
            },
            rating: { type: DataTypes.INTEGER, allowNull: false },
            comment: { type: DataTypes.TEXT, allowNull: true },
            status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), allowNull: false, defaultValue: 'pending' },
            ...timestamps
        });

        await queryInterface.createTable('notifications', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: 'users', key: 'id' },
                onDelete: 'CASCADE'
            },
            channel: { type: DataTypes.ENUM('email', 'sms', 'whatsapp', 'in_app'), allowNull: false },
            type: { type: DataTypes.STRING, allowNull: false },
            payload: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
            status: { type: DataTypes.ENUM('queued', 'sent', 'failed'), allowNull: false, defaultValue: 'queued' },
            readAt: { type: DataTypes.DATE, allowNull: true },
            ...timestamps
        });

        await queryInterface.createTable('wishlists', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onDelete: 'CASCADE'
            },
            productId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'products', key: 'id' },
                onDelete: 'CASCADE'
            },
            ...timestamps
        });
        await queryInterface.addIndex('wishlists', ['userId', 'productId'], { unique: true });

        await queryInterface.createTable('banners', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            title: { type: DataTypes.STRING, allowNull: false },
            imageUrl: { type: DataTypes.STRING, allowNull: false },
            link: { type: DataTypes.STRING, allowNull: true },
            placement: { type: DataTypes.STRING, allowNull: false, defaultValue: 'home' },
            active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            ...timestamps
        });

        await queryInterface.createTable('otp_requests', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            requestId: { type: DataTypes.STRING, allowNull: false, unique: true },
            identifier: { type: DataTypes.STRING, allowNull: false },
            otpHash: { type: DataTypes.STRING, allowNull: false },
            expiresAt: { type: DataTypes.DATE, allowNull: false },
            consumedAt: { type: DataTypes.DATE, allowNull: true },
            attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            ...timestamps
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('otp_requests');
        await queryInterface.dropTable('banners');
        await queryInterface.dropTable('wishlists');
        await queryInterface.dropTable('notifications');
        await queryInterface.dropTable('reviews');
        await queryInterface.dropTable('shipments');
        await queryInterface.dropTable('payments');
        await queryInterface.dropTable('order_items');
        await queryInterface.dropTable('orders');
        await queryInterface.dropTable('cart_items');
        await queryInterface.dropTable('carts');
        await queryInterface.dropTable('coupons');
        await queryInterface.dropTable('fitment_compatibilities');
        await queryInterface.dropTable('product_variants');
        await queryInterface.dropTable('products');
        await queryInterface.dropTable('brands');
        await queryInterface.dropTable('categories');
        await queryInterface.dropTable('addresses');
        await queryInterface.dropTable('admin_users');
        await queryInterface.dropTable('users');

        const dropEnum = async (name) => {
            await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${name}";`);
        };
        await Promise.all(
            [
                'enum_users_authProvider',
                'enum_admin_users_role',
                'enum_products_status',
                'enum_coupons_type',
                'enum_orders_status',
                'enum_payments_gateway',
                'enum_payments_method',
                'enum_payments_status',
                'enum_shipments_status',
                'enum_reviews_status',
                'enum_notifications_channel',
                'enum_notifications_status'
            ].map(dropEnum)
        );
    }
};
