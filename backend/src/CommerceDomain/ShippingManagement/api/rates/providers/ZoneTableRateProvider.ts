import { RateProvider, RateQuote, RateRequest } from '../rate.types';

/**
 * Estimated shipping rates from our own zone + weight table. Used when no live courier account is
 * configured, and as the fallback if a live courier API call fails — checkout must never break
 * because a third-party API is down.
 *
 * The numbers below are ILLUSTRATIVE DEFAULTS in the range Indian courier aggregators charge, not
 * a real rate card. They are intentionally kept in one obvious place so they can be tuned to your
 * actual Shiprocket rates (or replaced entirely by setting SHIPROCKET_EMAIL/PASSWORD, which
 * switches quoting to live rates).
 */

type Zone = 'A' | 'B' | 'C' | 'D' | 'E';

/** Paise: charge for the first 500 g slab, then per additional 500 g slab. */
const ZONE_RATES: Record<Zone, { first: number; extra: number }> = {
    A: { first: 4000, extra: 2500 }, // within city
    B: { first: 5000, extra: 3500 }, // within region / state
    C: { first: 6000, extra: 4500 }, // metro to metro
    D: { first: 7000, extra: 5500 }, // rest of India
    E: { first: 12000, extra: 9000 } // North-East, J&K, islands
};

const ETA_DAYS: Record<Zone, number> = { A: 2, B: 3, C: 4, D: 6, E: 9 };

const GST_PERCENT = 18;
const COD_MIN_PAISE = 3500;
const COD_PERCENT = 2;

/** First three digits of the pincode identify the metro sorting hub. */
const METRO_PREFIXES = new Set(['110', '122', '201', '400', '410', '411', '500', '560', '600', '700', '380', '302']);
/** Special zone: J&K (18x, 19x), Assam and the North-East (78x, 79x), Andaman & Nicobar (744). */
const isSpecialZone = (pin: string) => /^(18|19|78|79)/.test(pin) || pin.startsWith('744');

export function zoneFor(pickup: string, delivery: string): Zone {
    if (isSpecialZone(pickup) || isSpecialZone(delivery)) return 'E';
    if (pickup.slice(0, 3) === delivery.slice(0, 3)) return 'A';
    if (pickup.slice(0, 2) === delivery.slice(0, 2)) return 'B';
    if (METRO_PREFIXES.has(pickup.slice(0, 3)) && METRO_PREFIXES.has(delivery.slice(0, 3))) return 'C';
    return 'D';
}

export class ZoneTableRateProvider implements RateProvider {
    async quote(req: RateRequest): Promise<RateQuote> {
        const zone = zoneFor(req.pickupPincode, req.deliveryPincode);
        const { first, extra } = ZONE_RATES[zone];
        const slabs = Math.max(1, Math.ceil(req.chargeableWeightGrams / 500));

        let freight = first + (slabs - 1) * extra;
        if (req.cod) freight += Math.max(COD_MIN_PAISE, Math.round((req.declaredValuePaise * COD_PERCENT) / 100));
        const amountPaise = Math.round(freight * (1 + GST_PERCENT / 100));

        return { courierName: 'Standard delivery', amountPaise, etaDays: ETA_DAYS[zone], source: 'estimate' };
    }
}
