/**
 * Tailwind config, reconciled with the Design agent's published tokens at
 * /design/tailwind.tokens.js (sourced from /design/design-system.md — primary blue #123B72,
 * accent orange #E2600A, neutral grays, Inter font). The full numeric color scales (primary-50..900
 * etc.) are spread in directly so components can use e.g. `bg-primary-100`; semantic aliases
 * (`bg-primary`, `text-primary-foreground`, `border-border`, ...) are layered on top so the
 * shared UI primitives written against those names keep working.
 */
import designTokens from "../design/tailwind.tokens.js";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { xl: "1280px" }
    },
    extend: {
      ...designTokens,
      colors: {
        ...designTokens.colors,
        border: designTokens.colors.neutral[200],
        input: designTokens.colors.neutral[300],
        ring: designTokens.colors.primary[700],
        background: designTokens.colors.neutral[0],
        foreground: designTokens.colors.neutral[800],
        primary: {
          ...designTokens.colors.primary,
          DEFAULT: designTokens.colors.primary[700],
          foreground: designTokens.colors.neutral[0]
        },
        secondary: {
          DEFAULT: designTokens.colors.neutral[100],
          foreground: designTokens.colors.neutral[800]
        },
        accent: {
          ...designTokens.colors.accent,
          DEFAULT: designTokens.colors.accent[600],
          foreground: designTokens.colors.neutral[0]
        },
        destructive: {
          DEFAULT: designTokens.colors.danger[600],
          foreground: designTokens.colors.neutral[0]
        },
        success: {
          DEFAULT: designTokens.colors.success[600],
          foreground: designTokens.colors.neutral[0]
        },
        warning: {
          DEFAULT: designTokens.colors.warning[600],
          foreground: designTokens.colors.neutral[0]
        },
        muted: {
          DEFAULT: designTokens.colors.neutral[100],
          foreground: designTokens.colors.neutral[500]
        },
        card: {
          DEFAULT: designTokens.colors.neutral[0],
          foreground: designTokens.colors.neutral[800]
        },
        popover: {
          DEFAULT: designTokens.colors.neutral[0],
          foreground: designTokens.colors.neutral[800]
        }
      },
      borderRadius: {
        ...designTokens.borderRadius,
        lg: designTokens.borderRadius.lg,
        md: designTokens.borderRadius.md,
        sm: designTokens.borderRadius.sm
      }
    }
  },
  plugins: []
};
