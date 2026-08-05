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
        // Apple Rondesign Crimson Accent system (mapping old gold tags to rose/crimson)
        gold: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#e11d48',
          600: '#be123c',
          700: '#9f1239',
          800: '#881337',
          900: '#4c0519',
          950: '#1c020a',
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
        'gold-gradient': 'linear-gradient(135deg, #e11d48 0%, #be123c 60%, #4c0519 100%)',
      },
      boxShadow: {
        'gold-sm':  '0 2px 12px rgba(225,29,72,0.15)',
        'gold-md':  '0 4px 24px rgba(225,29,72,0.2)',
        'gold-lg':  '0 8px 40px rgba(225,29,72,0.25)',
        'gold-glow':'0 0 20px rgba(225,29,72,0.12)',
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
