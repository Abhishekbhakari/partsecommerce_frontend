import { Op } from 'sequelize';
import { Seller } from '../../../../Common/database/models';
import WinstonLogger from '../../../../Common/logger/WinstonLogger';
import { QuoteItem, RateProvider, ShipmentQuote, ShippingQuote } from './rate.types';
import { ShiprocketRateProvider } from './providers/ShiprocketRateProvider';
import { ZoneTableRateProvider } from './providers/ZoneTableRateProvider';

/** Used when a product has no weight recorded (legacy/imported products) — a light small part. */
const DEFAULT_ITEM_WEIGHT_GRAMS = 500;
/** Where parcels are assumed to leave from when a seller hasn't set a pickup address yet. */
const DEFAULT_PICKUP_PINCODE = process.env.DEFAULT_PICKUP_PINCODE || '110001';
/** Couriers divide L x W x H (cm) by 5000 to get volumetric kg. */
const VOLUMETRIC_DIVISOR = 5000;

const estimateProvider: RateProvider = new ZoneTableRateProvider();

const liveProvider: RateProvider | null =
    process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD
        ? new ShiprocketRateProvider(
              process.env.SHIPROCKET_EMAIL,
              process.env.SHIPROCKET_PASSWORD,
              process.env.SHIPROCKET_RATE_INCLUDES_GST === 'true'
          )
        : null;

/** Chargeable weight for one parcel: the LARGER of real weight and volumetric weight. A light but
 * bulky box is billed as bulky — which is why product dimensions matter, not just weight. */
export function chargeableWeightGrams(items: QuoteItem[]): number {
    let dead = 0;
    let volumetricKg = 0;
    for (const it of items) {
        dead += (it.weightGrams ?? DEFAULT_ITEM_WEIGHT_GRAMS) * it.qty;
        if (it.lengthCm && it.widthCm && it.heightCm) {
            volumetricKg += ((it.lengthCm * it.widthCm * it.heightCm) / VOLUMETRIC_DIVISOR) * it.qty;
        }
    }
    return Math.max(dead, Math.round(volumetricKg * 1000));
}

/** Optional promo: waive shipping above this order value. 0 (default) = never waive. NOTE this makes
 * the PLATFORM absorb the real freight cost, so only enable it if margins can carry it. */
const FREE_SHIPPING_THRESHOLD_PAISE = Number(process.env.FREE_SHIPPING_THRESHOLD_PAISE || 0);

/** Cart/order rows as the repositories return them -> the plain shape the quoter needs. */
export interface QuotableRow {
    qty: number;
    priceAtAdd: number;
    variant: {
        weightGrams: number | null;
        lengthCm: number | null;
        widthCm: number | null;
        heightCm: number | null;
        product: { sellerId: number };
    };
}

export const toQuoteItems = (rows: QuotableRow[]): QuoteItem[] =>
    rows.map((r) => ({
        sellerId: r.variant.product.sellerId,
        qty: r.qty,
        weightGrams: r.variant.weightGrams,
        lengthCm: r.variant.lengthCm,
        widthCm: r.variant.widthCm,
        heightCm: r.variant.heightCm,
        linePaise: r.qty * r.priceAtAdd
    }));

/** What the buyer is actually charged, after any free-shipping promo. */
export const chargeableShippingPaise = (quote: ShippingQuote, netOrderPaise: number): number =>
    FREE_SHIPPING_THRESHOLD_PAISE > 0 && netOrderPaise >= FREE_SHIPPING_THRESHOLD_PAISE ? 0 : quote.totalPaise;

class ShippingRateService {
    /** True when quotes are real courier rates rather than our own estimate table. */
    get isLive() {
        return liveProvider !== null;
    }

    /**
     * Quotes shipping for a cart/order: one parcel per seller (each seller ships their own items
     * from their own location), summed. Never throws on a courier failure — falls back to the
     * estimate table so a third-party outage can't block checkout.
     */
    async quote(items: QuoteItem[], deliveryPincode: string, cod: boolean): Promise<ShippingQuote> {
        const bySeller = new Map<number, QuoteItem[]>();
        for (const it of items) bySeller.set(it.sellerId, [...(bySeller.get(it.sellerId) ?? []), it]);

        const sellerIds = [...bySeller.keys()];
        const sellers = sellerIds.length ? await Seller.findAll({ where: { id: { [Op.in]: sellerIds } } }) : [];
        const sellerById = new Map(sellers.map((s) => [s.id, s]));

        const shipments: ShipmentQuote[] = [];
        for (const [sellerId, group] of bySeller) {
            const seller = sellerById.get(sellerId);
            const pickupPincode = seller?.pickupAddress?.pincode || DEFAULT_PICKUP_PINCODE;
            const request = {
                pickupPincode,
                deliveryPincode,
                chargeableWeightGrams: chargeableWeightGrams(group),
                cod,
                declaredValuePaise: group.reduce((sum, i) => sum + i.linePaise, 0)
            };

            let quote;
            try {
                quote = await (liveProvider ?? estimateProvider).quote(request);
            } catch (error) {
                WinstonLogger.logger.log({
                    message: `[ShippingRate] Live courier quote failed, using estimate instead: ${String(error)}`,
                    level: 'warn'
                });
                quote = await estimateProvider.quote(request);
            }

            shipments.push({
                ...quote,
                sellerId,
                sellerName: seller?.businessName ?? `Seller #${sellerId}`,
                pickupPincode,
                chargeableWeightGrams: request.chargeableWeightGrams,
                pickupAddressMissing: !seller?.pickupAddress?.pincode
            });
        }

        return {
            shipments,
            totalPaise: shipments.reduce((sum, s) => sum + s.amountPaise, 0),
            etaDays: shipments.reduce((max, s) => Math.max(max, s.etaDays), 0)
        };
    }
}

export default new ShippingRateService();
