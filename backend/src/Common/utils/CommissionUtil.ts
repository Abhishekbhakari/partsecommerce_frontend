import { Settings, Seller } from '../database/models';

const SETTINGS_KEY = 'platform_commission_rate_percent';
const FALLBACK_RATE = 10;

class CommissionUtil {
    async getPlatformDefaultRate(): Promise<number> {
        const row = await Settings.findOne({ where: { key: SETTINGS_KEY } });
        const parsed = row ? Number(row.value) : NaN;
        return Number.isFinite(parsed) ? parsed : FALLBACK_RATE;
    }

    async setPlatformDefaultRate(rate: number): Promise<void> {
        await Settings.upsert({ key: SETTINGS_KEY, value: String(rate) } as never);
    }

    /** A seller's effective commission rate — their own override if set, else the platform default. */
    async getRateForSeller(sellerId: number): Promise<number> {
        const seller = await Seller.findByPk(sellerId);
        if (seller?.commissionRateOverride !== null && seller?.commissionRateOverride !== undefined) {
            return Number(seller.commissionRateOverride);
        }
        return this.getPlatformDefaultRate();
    }

    /** Computes commissionAmount (paise) and sellerEarning (paise) for a line total, at a given rate. */
    compute(lineTotal: number, rate: number): { commissionAmount: number; sellerEarning: number } {
        const commissionAmount = Math.round((lineTotal * rate) / 100);
        return { commissionAmount, sellerEarning: lineTotal - commissionAmount };
    }
}

export default new CommissionUtil();
