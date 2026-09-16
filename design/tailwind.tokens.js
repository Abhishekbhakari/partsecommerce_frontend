/**
 * Tailwind theme tokens — Spare Parts E-commerce Platform
 *
 * Generated from design/design-system.md. Paste this object into
 * `tailwind.config.js` as `theme.extend` (or spread its keys individually),
 * e.g.:
 *
 *   const designTokens = require('./design/tailwind.tokens.js');
 *   module.exports = {
 *     content: [...],
 *     theme: { extend: designTokens },
 *   };
 *
 * Do not hand-edit color hex values here without updating design-system.md
 * to match — the two must stay in sync.
 */

module.exports = {
  colors: {
    primary: {
      50: '#EFF4FB',
      100: '#DCE6F5',
      200: '#B7CCE9',
      300: '#8DAEDA',
      400: '#5A87C4',
      500: '#33619E',
      600: '#204A82',
      700: '#123B72', // brand primary
      800: '#0D2C57',
      900: '#081D3B',
    },
    accent: {
      50: '#FFF3EB',
      100: '#FFE1CC',
      300: '#FFAD73',
      500: '#F5730C',
      600: '#E2600A', // CTA default
      700: '#C24E08',
      800: '#9C3E07',
    },
    neutral: {
      0: '#FFFFFF',
      50: '#F7F8FA',
      100: '#EEF0F3',
      200: '#DFE3E8',
      300: '#C7CDD6',
      400: '#9AA3B2',
      500: '#6B7385',
      600: '#4C5366',
      700: '#333A4D',
      800: '#1F2433',
      900: '#121521',
    },
    success: {
      50: '#EAF9EF',
      600: '#1C9A4B',
      700: '#157A3B',
    },
    warning: {
      50: '#FFF8E6',
      600: '#B7791F',
      700: '#8F5D14',
    },
    danger: {
      50: '#FDECEC',
      600: '#D5342E',
      700: '#AE2621',
    },
    info: {
      50: '#EAF3FC',
      600: '#1E6FB8',
    },
  },

  fontFamily: {
    sans: ['Inter', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
  },

  fontSize: {
    xs: ['12px', { lineHeight: '16px' }],
    sm: ['14px', { lineHeight: '20px' }],
    base: ['16px', { lineHeight: '24px' }],
    lg: ['18px', { lineHeight: '28px' }],
    xl: ['20px', { lineHeight: '28px' }],
    '2xl': ['24px', { lineHeight: '32px' }],
    '3xl': ['30px', { lineHeight: '36px' }],
    '4xl': ['36px', { lineHeight: '40px' }],
    '5xl': ['48px', { lineHeight: '52px' }],
    'price-sm': ['16px', { lineHeight: '20px', fontWeight: '700' }],
    'price-lg': ['28px', { lineHeight: '32px', fontWeight: '800' }],
  },

  spacing: {
    // Matches Tailwind defaults on the 4px scale; declared explicitly so
    // the token set is self-documenting and portable.
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
  },

  borderRadius: {
    none: '0px',
    sm: '4px',
    DEFAULT: '8px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  boxShadow: {
    sm: '0 1px 2px rgba(18,21,33,0.06)',
    card: '0 1px 3px rgba(18,21,33,0.08), 0 1px 2px rgba(18,21,33,0.04)',
    md: '0 4px 12px rgba(18,21,33,0.10)',
    lg: '0 12px 32px rgba(18,21,33,0.16)',
  },

  screens: {
    // Tailwind defaults — declared for parity with docs/DESIGN_BRIEF.md breakpoints.
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },

  maxWidth: {
    content: '1280px',
  },
};
