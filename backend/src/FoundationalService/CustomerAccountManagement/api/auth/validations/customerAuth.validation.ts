import { z } from 'zod';

export const OtpRequestSchema = z.object({
    identifier: z.string().min(3, 'Phone or email is required')
});

export const OtpVerifySchema = z.object({
    requestId: z.string().min(1, 'requestId is required'),
    otp: z.string().length(6, 'OTP must be 6 digits')
});

export const EmailLoginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
});

export const EmailRegisterSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[a-z]/, 'Password must contain a lowercase letter')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[0-9]/, 'Password must contain a number')
});

export const GoogleAuthSchema = z.object({
    idToken: z.string().min(1, 'idToken is required')
});

export const RefreshTokenSchema = z.object({
    refreshToken: z.string().min(1).optional()
});

export type OtpRequestPayload = z.infer<typeof OtpRequestSchema>;
export type OtpVerifyPayload = z.infer<typeof OtpVerifySchema>;
export type EmailLoginPayload = z.infer<typeof EmailLoginSchema>;
export type EmailRegisterPayload = z.infer<typeof EmailRegisterSchema>;
export type GoogleAuthPayload = z.infer<typeof GoogleAuthSchema>;
