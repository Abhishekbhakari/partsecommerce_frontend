import { z } from "zod";

export const emailLoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const otpRequestSchema = z.object({
  identifier: z.string().min(6, "Enter a valid phone number or email")
});

export const otpVerifySchema = z.object({
  otp: z.string().length(6, "Enter the 6-digit code")
});
