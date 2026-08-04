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
        // Luxury gold accent system
        gold: {
          50:  '#fdf8ec',
          100: '#f7e9c0',
          200: '#edda8a',
          300: '#e3c45a',
          400: '#d9b03a',
          500: '#c9a84c',
          600: '#a8882a',
          700: '#7a6030',
          800: '#5a4520',
          900: '#3a2c14',
          950: '#1e1608',
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
        'gold-gradient': 'linear-gradient(135deg, #7a6030 0%, #c9a84c 60%, #e3c45a 100%)',
      },
      boxShadow: {
        'gold-sm':  '0 2px 12px rgba(201,168,76,0.25)',
        'gold-md':  '0 4px 24px rgba(201,168,76,0.35)',
        'gold-lg':  '0 8px 40px rgba(201,168,76,0.3)',
        'gold-glow':'0 0 20px rgba(201,168,76,0.2)',
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
