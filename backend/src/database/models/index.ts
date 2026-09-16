import sequelize from '../../Common/database/config/sequelize';
import { User } from './User';
import { Address } from './Address';
import { Category } from './Category';
import { Brand } from './Brand';
import { Product } from './Product';
import { ProductVariant } from './ProductVariant';
import { FitmentCompatibility } from './FitmentCompatibility';
import { Cart } from './Cart';
import { CartItem } from './CartItem';
import { Order } from './Order';
import { OrderItem } from './OrderItem';
import { Payment } from './Payment';
import { Coupon } from './Coupon';
import { Review } from './Review';
import { Shipment } from './Shipment';
import { AdminUser } from './AdminUser';
import { Notification } from './Notification';
import { Wishlist } from './Wishlist';
import { Banner } from './Banner';
import { OtpRequest } from './OtpRequest';

/* ---- User ---- */
User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Cart, { foreignKey: 'userId', as: 'carts' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.belongsToMany(Product, { through: Wishlist, foreignKey: 'userId', otherKey: 'productId', as: 'wishlistProducts' });
Product.belongsToMany(User, { through: Wishlist, foreignKey: 'productId', otherKey: 'userId', as: 'wishlistedBy' });

/* ---- Category / Brand / Product ---- */
Category.hasMany(Category, { foreignKey: 'parentId', as: 'children' });
Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' });

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Brand.hasMany(Product, { foreignKey: 'brandId', as: 'products' });
Product.belongsTo(Brand, { foreignKey: 'brandId', as: 'brand' });

Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(FitmentCompatibility, { foreignKey: 'productId', as: 'fitment' });
FitmentCompatibility.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

/* ---- Cart ---- */
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });

ProductVariant.hasMany(CartItem, { foreignKey: 'variantId', as: 'cartItems' });
CartItem.belongsTo(ProductVariant, { foreignKey: 'variantId', as: 'variant' });

Coupon.hasMany(Cart, { foreignKey: 'couponId', as: 'carts' });
Cart.belongsTo(Coupon, { foreignKey: 'couponId', as: 'coupon' });

/* ---- Order ---- */
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

ProductVariant.hasMany(OrderItem, { foreignKey: 'variantId', as: 'orderItems' });
OrderItem.belongsTo(ProductVariant, { foreignKey: 'variantId', as: 'variant' });

Order.hasOne(Payment, { foreignKey: 'orderId', as: 'payment' });
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Order.hasOne(Shipment, { foreignKey: 'orderId', as: 'shipment' });
Shipment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Coupon.hasMany(Order, { foreignKey: 'couponId', as: 'orders' });
Order.belongsTo(Coupon, { foreignKey: 'couponId', as: 'coupon' });

OrderItem.hasOne(Review, { foreignKey: 'orderItemId', as: 'review' });
Review.belongsTo(OrderItem, { foreignKey: 'orderItemId', as: 'orderItem' });

export {
    sequelize,
    User,
    Address,
    Category,
    Brand,
    Product,
    ProductVariant,
    FitmentCompatibility,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Payment,
    Coupon,
    Review,
    Shipment,
    AdminUser,
    Notification,
    Wishlist,
    Banner,
    OtpRequest
};
