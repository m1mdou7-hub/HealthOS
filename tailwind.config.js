const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'pages/**/*.{ts,tsx}'
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        sans:  ['var(--font-sans)', ...fontFamily.sans],
        serif: ['Cormorant Garamond', 'Georgia', ...fontFamily.serif],
      },
      colors: {
        // Apple Minimalist Accent system (mapping old gold tags to zinc/white)
        gold: {
          50:  '#ffffff',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#ffffff',
          600: '#e4e4e7',
          700: '#71717a',
          800: '#3f3f46',
          900: '#27272a',
          950: '#18181b',
        },
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 }
        },
        'shimmer': {
          '0%, 100%': { opacity: '0.5' },
          '50%':       { opacity: '1'   },
        },
        'blink': {
          '0%, 100%': { opacity: '1'   },
          '50%':       { opacity: '0.3' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'shimmer':        'shimmer 3s ease-in-out infinite',
        'blink':          'blink 2s ease-in-out infinite',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #ffffff 0%, #fafafa 50%, #d4d4d8 100%)',
      },
      boxShadow: {
        'gold-sm':  '0 2px 12px rgba(255,255,255,0.05)',
        'gold-md':  '0 4px 24px rgba(255,255,255,0.1)',
        'gold-lg':  '0 8px 40px rgba(255,255,255,0.12)',
        'gold-glow':'0 0 20px rgba(255,255,255,0.08)',
      },
    }
  },
  plugins: [
    require('tailwindcss-animate'),
    // Adds direction-aware (logical) utilities such as ms-*, me-*, ps-*, pe-*,
    // start-*, end-* and float-start/float-end that automatically respect the
    // document `dir` attribute (rtl for Arabic, ltr for English).
    require('tailwindcss-rtl')
  ]
};
