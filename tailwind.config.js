const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-mode="dark"]'],
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
        sans:  ['Manrope', 'Inter', ...fontFamily.sans],
        display: ['"Space Grotesk"', 'Manrope', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', ...fontFamily.mono],
        serif: ['Cormorant Garamond', 'Georgia', ...fontFamily.serif]
      },
      colors: {
        // Luxury Purple (Amethyst & Orchid)
        purple: {
          50:  '#FBF1FF',
          100: '#E3D0EA',
          200: '#D3B4E0',
          300: '#BC92CE',
          400: '#AB7FC2',
          500: '#9B71B2',
          600: '#7A4F92',
          700: '#5A3371',
          800: '#3A1C36',
          900: '#241022',
          950: '#0b0710'
        },
        // Luxury Earth
        chestnut: {
          50:  '#E8E1DA',
          100: '#D4C7BC',
          200: '#B7A28F',
          300: '#997E66',
          400: '#77614F',
          500: '#55443A',
          600: '#45372F',
          700: '#352A24',
          800: '#251E1A',
          900: '#191511'
        },
        morning: {
          50:  '#EEF1EF',
          100: '#D9DEDA',
          200: '#BFCAC4',
          300: '#A5B3AC',
          400: '#97A69E',
          500: '#8A9992',
          600: '#6C7A74',
          700: '#4F5C56',
          800: '#333D39',
          900: '#1F2623'
        },
        almond: {
          50:  '#F7F7F5',
          100: '#E9E9E5',
          200: '#D9DAD5',
          300: '#CFD0CD',
          400: '#A9AAA6',
          500: '#838480'
        }
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem'
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
          '50%':       { opacity: '1'   }
        },
        'blink': {
          '0%, 100%': { opacity: '1'   },
          '50%':       { opacity: '0.3' }
        },
        'float-y': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-16px)' }
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.55' },
          '50%':      { opacity: '1' }
        },
        'aurora': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.5' },
          '33%':      { transform: 'translate(40px, -30px) scale(1.15)', opacity: '0.8' },
          '66%':      { transform: 'translate(-30px, 20px) scale(0.95)', opacity: '0.6' }
        },
        'marquee': {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'shimmer':        'shimmer 3s ease-in-out infinite',
        'blink':          'blink 2s ease-in-out infinite',
        'float-y':        'float-y 7s ease-in-out infinite',
        'pulse-glow':     'pulse-glow 3.2s ease-in-out infinite',
        'aurora':         'aurora 14s ease-in-out infinite',
        'marquee':        'marquee 30s linear infinite'
      },
      boxShadow: {
        'soft':      '0 2px 12px rgba(0,0,0,0.08)',
        'elevated':  '0 24px 64px -24px rgba(0,0,0,0.55)',
        'glow':      '0 0 0 1px var(--border-strong), 0 12px 40px -12px var(--accent-glow)',
        'glow-lg':   '0 0 0 1px var(--border-strong), 0 32px 80px -32px var(--accent-glow)',
        'inner-line':'inset 0 1px 0 0 rgba(255,255,255,0.06)',
        'card':      'var(--shadow-card)',
        'pop':       'var(--shadow-pop)'
      },
      fontSize: {
        '2xs': '0.625rem'
      }
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
