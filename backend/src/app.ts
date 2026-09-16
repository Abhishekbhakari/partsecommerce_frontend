import path from 'path';
import express, { ErrorRequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import GlobalErrorHandlerConstant from './Common/constants/GlobalErrorHandlerConstant';
import WinstonLogger from './Common/logger/WinstonLogger';

import healthRouter from './APIGateway/api/health/health.router';

import adminAuthRouter from './FoundationalService/IdentityAccessManagement/api/auth/auth.router';
import staffRouter from './FoundationalService/IdentityAccessManagement/api/staff/staff.router';

import customerAuthRouter from './FoundationalService/CustomerAccountManagement/api/auth/customerAuth.router';
import profileRouter from './FoundationalService/CustomerAccountManagement/api/profile/profile.router';
import addressRouter from './FoundationalService/CustomerAccountManagement/api/addresses/address.router';
import wishlistRouter from './FoundationalService/CustomerAccountManagement/api/wishlist/wishlist.router';
import notificationRouter from './FoundationalService/CustomerAccountManagement/api/notifications/notification.router';
import notificationAdminRouter from './FoundationalService/CustomerAccountManagement/api/notifications/notificationAdmin.router';

import { categoryRouter, categoryAdminRouter } from './FoundationalService/MasterManagement/api/categories/category.router';
import { brandRouter, brandAdminRouter } from './FoundationalService/MasterManagement/api/brands/brand.router';
import couponRouter from './FoundationalService/MasterManagement/api/coupons/coupon.router';
import bannerRouter from './FoundationalService/MasterManagement/api/banners/banner.router';
import uploadRouter from './FoundationalService/MasterManagement/api/uploads/upload.router';

import { productRouter, productAdminRouter } from './CommerceDomain/CatalogManagement/api/products/product.router';
import inventoryRouter from './CommerceDomain/CatalogManagement/api/products/inventory.router';
import { autocompleteRouter, searchRouter } from './CommerceDomain/CatalogManagement/api/search/search.router';
import fitmentRouter from './CommerceDomain/CatalogManagement/api/fitment/fitment.router';

import cartRouter from './CommerceDomain/CartAndCheckout/api/cart/cart.router';
import checkoutRouter from './CommerceDomain/CartAndCheckout/api/checkout/checkout.router';
import { orderRouter, myOrdersRouter } from './CommerceDomain/CartAndCheckout/api/orders/order.router';
import { orderAdminRouter, customerAdminRouter } from './CommerceDomain/CartAndCheckout/api/orders/orderAdmin.router';

import paymentRouter from './CommerceDomain/PaymentManagement/api/payments/payment.router';

import shipmentRouter from './CommerceDomain/ShippingManagement/api/shipments/shipment.router';

import { productReviewRouter, reviewAdminRouter } from './CommerceDomain/ReviewManagement/api/reviews/review.router';

import reportRouter from './CommerceDomain/ReportingAndAnalytics/api/reports/report.router';

const app = express();
const NAMESPACE = '[APPLICATION]:';
const API_BASE = '/api/v1';

app.disable('x-powered-by');

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' } // allow static document/CSV downloads
    })
);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true); // curl/Postman/server-to-server
            if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error(`CORS blocked: origin ${origin} is not allowed`));
        },
        methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Cart-Session'],
        exposedHeaders: ['Content-Disposition', 'X-Cart-Session'],
        credentials: true
    })
);

app.use(express.json());
app.use(cookieParser());

/* Static file serving for locally-stored uploads (see FoundationalService/MasterManagement/api/uploads). */
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please slow down.' }
});
app.use(API_BASE, globalLimiter);

/* request logger — registered before routes so every request (incl. 404s) is logged */
app.use((req, res, next) => {
    const ipHeader = req.headers['x-forwarded-for'] as string;
    const ip = ipHeader?.split(',').shift() ?? req.socket?.remoteAddress;
    const reqUrl = req.url;

    WinstonLogger.logger.log({
        message: `${NAMESPACE} METHOD: [${req.method}] - URL: [${reqUrl}] - IP: [${ip}]`,
        level: 'info'
    });
    res.on('finish', () => {
        WinstonLogger.logger.log({
            message: `${NAMESPACE} METHOD: [${req.method}] - URL: [${reqUrl}] - IP: [${ip}] - STATUS: [${res.statusCode}]`,
            level: 'info'
        });
    });
    next();
});

app.use('/health', healthRouter);

// --- FoundationalService: IdentityAccessManagement (admin/staff) ---
app.use(`${API_BASE}/admin/auth`, adminAuthRouter);
app.use(`${API_BASE}/admin/staff`, staffRouter);

// --- FoundationalService: CustomerAccountManagement ---
app.use(`${API_BASE}/auth`, customerAuthRouter);
app.use(`${API_BASE}/me`, profileRouter);
app.use(`${API_BASE}/me`, addressRouter);
app.use(`${API_BASE}/me`, wishlistRouter);
app.use(`${API_BASE}/me`, notificationRouter);
app.use(`${API_BASE}/me`, myOrdersRouter);
app.use(`${API_BASE}/admin/notifications`, notificationAdminRouter);

// --- FoundationalService: MasterManagement ---
app.use(`${API_BASE}/categories`, categoryRouter);
app.use(`${API_BASE}/admin/categories`, categoryAdminRouter);
app.use(`${API_BASE}/brands`, brandRouter);
app.use(`${API_BASE}/admin/brands`, brandAdminRouter);
app.use(`${API_BASE}/admin/coupons`, couponRouter);
app.use(`${API_BASE}/admin/banners`, bannerRouter);
app.use(`${API_BASE}/admin/uploads`, uploadRouter);

// --- CommerceDomain: CatalogManagement ---
app.use(`${API_BASE}/products`, productRouter);
app.use(`${API_BASE}/admin/products`, productAdminRouter);
app.use(`${API_BASE}/admin/inventory`, inventoryRouter);
app.use(`${API_BASE}/search/autocomplete`, autocompleteRouter);
app.use(`${API_BASE}/search`, searchRouter);
app.use(`${API_BASE}/fitment`, fitmentRouter);
app.use(`${API_BASE}/products/:id/reviews`, productReviewRouter);
app.use(`${API_BASE}/admin/reviews`, reviewAdminRouter);

// --- CommerceDomain: CartAndCheckout ---
app.use(`${API_BASE}/cart`, cartRouter);
app.use(`${API_BASE}/checkout`, checkoutRouter);
app.use(`${API_BASE}/orders`, orderRouter);
app.use(`${API_BASE}/admin/orders`, orderAdminRouter);
app.use(`${API_BASE}/admin/customers`, customerAdminRouter);

// --- CommerceDomain: PaymentManagement ---
app.use(`${API_BASE}/payments`, paymentRouter);

// --- CommerceDomain: ShippingManagement ---
app.use(`${API_BASE}/shipments`, shipmentRouter);

// --- CommerceDomain: ReportingAndAnalytics ---
app.use(`${API_BASE}/admin/reports`, reportRouter);

/* 404 fallback */
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

/* global error handler */
const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
    if (err?.message === GlobalErrorHandlerConstant.INCOMING_REQ_BODY_TOO_LARGE) {
        WinstonLogger.logger.log({
            message: `${NAMESPACE} Incoming request body too large, URL=${req.originalUrl}`,
            level: 'error'
        });
    } else {
        WinstonLogger.logger.log({ message: `${NAMESPACE} Global Error Handler: ${err?.message}`, level: 'error' });
    }
    res.status(500).json({ success: false, message: err?.message || 'Internal server error.' });
};
app.use(errorHandler);

export default app;
