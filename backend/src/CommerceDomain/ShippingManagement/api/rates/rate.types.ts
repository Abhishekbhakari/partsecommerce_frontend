/** All money in paise (integer), all weights in grams — same conventions as the rest of the API. */

export interface RateRequest {
    pickupPincode: string;
    deliveryPincode: string;
    /** Chargeable weight already resolved (max of dead vs volumetric), in grams. */
    chargeableWeightGrams: number;
    cod: boolean;
    /** Order value being shipped — COD fees are a percentage of this. */
    declaredValuePaise: number;
}

export interface RateQuote {
    courierName: string;
    /** What we charge for freight (incl. GST and COD fee where applicable), in paise. */
    amountPaise: number;
    etaDays: number;
    /** 'shiprocket' = live courier rate; 'estimate' = our own zone/weight table. */
    source: 'shiprocket' | 'estimate';
}

export interface RateProvider {
    quote(req: RateRequest): Promise<RateQuote>;
}

/** One parcel = one seller's items in an order. */
export interface ShipmentQuote extends RateQuote {
    sellerId: number;
    sellerName: string;
    pickupPincode: string;
    chargeableWeightGrams: number;
    /** True when the seller hasn't set a pickup address yet, so a default origin was assumed. */
    pickupAddressMissing: boolean;
}

export interface ShippingQuote {
    shipments: ShipmentQuote[];
    totalPaise: number;
    /** Slowest parcel decides when the buyer has everything. */
    etaDays: number;
}

export interface QuoteItem {
    sellerId: number;
    qty: number;
    weightGrams: number | null;
    lengthCm: number | null;
    widthCm: number | null;
    heightCm: number | null;
    linePaise: number;
}
