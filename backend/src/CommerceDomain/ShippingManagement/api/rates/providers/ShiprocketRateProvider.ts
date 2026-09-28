import { RateProvider, RateQuote, RateRequest } from '../rate.types';

const BASE = 'https://apiv2.shiprocket.in/v1/external';
const GST_PERCENT = 18;

/** Shiprocket's login token is valid for days; refresh a bit early so a request never races expiry. */
const TOKEN_TTL_MS = 8 * 24 * 60 * 60 * 1000;

interface ServiceableCourier {
    courier_name: string;
    /** Total freight in rupees as Shiprocket reports it (COD fee included when cod=1). */
    rate: number;
    estimated_delivery_days?: string | number;
    etd_hours?: number;
}

/**
 * Live courier rates via Shiprocket's serviceability API. It returns every courier that can carry
 * the parcel between the two pincodes with its price and delivery estimate; we offer the cheapest.
 *
 * ASSUMPTIONS TO VERIFY against your first real Shiprocket invoice (I could not test against a
 * live account):
 *  1. `rate` is quoted EXCLUDING GST, so 18% is added. If your invoices show GST is already inside
 *     the number, set SHIPROCKET_RATE_INCLUDES_GST=true.
 *  2. Endpoint shape follows Shiprocket's public API docs as I know them; if a field is missing the
 *     provider throws and the service falls back to the estimate table instead of failing checkout.
 */
export class ShiprocketRateProvider implements RateProvider {
    private token: string | null = null;
    private tokenAt = 0;

    constructor(
        private readonly email: string,
        private readonly password: string,
        private readonly rateIncludesGst: boolean
    ) {}

    private async getToken(): Promise<string> {
        if (this.token && Date.now() - this.tokenAt < TOKEN_TTL_MS) return this.token;
        const res = await fetch(`${BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: this.email, password: this.password })
        });
        const body = (await res.json()) as { token?: string; message?: string };
        if (!res.ok || !body.token) throw new Error(`Shiprocket login failed: ${body.message ?? res.statusText}`);
        this.token = body.token;
        this.tokenAt = Date.now();
        return this.token;
    }

    async quote(req: RateRequest): Promise<RateQuote> {
        const params = new URLSearchParams({
            pickup_postcode: req.pickupPincode,
            delivery_postcode: req.deliveryPincode,
            weight: (req.chargeableWeightGrams / 1000).toFixed(2),
            cod: req.cod ? '1' : '0',
            declared_value: String(Math.round(req.declaredValuePaise / 100))
        });

        const call = async (token: string) =>
            fetch(`${BASE}/courier/serviceability/?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

        let res = await call(await this.getToken());
        if (res.status === 401) {
            // Token was revoked/expired early — log in again once and retry.
            this.token = null;
            res = await call(await this.getToken());
        }
        const body = (await res.json()) as {
            status?: number;
            message?: string;
            data?: { available_courier_companies?: ServiceableCourier[] };
        };
        const couriers = body.data?.available_courier_companies;
        if (!res.ok || !couriers?.length) {
            throw new Error(`Shiprocket returned no couriers: ${body.message ?? `HTTP ${res.status}`}`);
        }

        const cheapest = couriers.reduce((a, b) => (b.rate < a.rate ? b : a));
        const rupees = this.rateIncludesGst ? cheapest.rate : cheapest.rate * (1 + GST_PERCENT / 100);
        const etaDays = Number(cheapest.estimated_delivery_days) || (cheapest.etd_hours ? Math.ceil(cheapest.etd_hours / 24) : 5);

        return { courierName: cheapest.courier_name, amountPaise: Math.round(rupees * 100), etaDays, source: 'shiprocket' };
    }
}
