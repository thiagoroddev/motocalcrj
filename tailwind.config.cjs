/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#007BFF',
        secondary: '#ADC7FF',
        tertiary: '#00285B',
        surface: '#0D1321',
        'surface-dim': '#0D1321',
        'surface-bright': '#333948',
        'surface-cont': '#191f2e',
        neutral: '#C1C6D7',
        warning: '#FFB695',
        danger: '#93000A',
        success: '#22C55E',
        cyan: '#00C0E8',
        white: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'label-sm': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em', fontWeight: '500' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
      borderRadius: {
        btn: '4px',
        input: '4px',
        card: '8px',
      },
      minHeight: {
        touch: '48px',
      },
    },
  },
  plugins: [],
};
