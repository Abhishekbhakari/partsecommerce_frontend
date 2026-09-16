/**
 * Swappable OTP delivery interface. `ConsoleOtpSender` is the default (dev/stub) provider —
 * it just logs the OTP. Swap `getOtpSender()` for a real SMS/email gateway (e.g. MSG91,
 * Twilio) in production by branching on `process.env.OTP_PROVIDER`.
 */
import WinstonLogger from '../../../../../Common/logger/WinstonLogger';

export interface OtpSender {
    send(identifier: string, otp: string): Promise<void>;
}

class ConsoleOtpSender implements OtpSender {
    async send(identifier: string, otp: string): Promise<void> {
        WinstonLogger.logger.log({
            message: `[OtpSender:console] OTP for ${identifier} is ${otp} (stub — no real SMS/email sent).`,
            level: 'info'
        });
    }
}

let sender: OtpSender = new ConsoleOtpSender();

export const getOtpSender = (): OtpSender => sender;

/** Test/production hook to swap the provider without touching call sites. */
export const setOtpSender = (custom: OtpSender): void => {
    sender = custom;
};
