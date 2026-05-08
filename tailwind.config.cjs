/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:         'rgb(var(--color-primary)         / <alpha-value>)',
        secondary:       'rgb(var(--color-secondary)       / <alpha-value>)',
        tertiary:        'rgb(var(--color-tertiary)        / <alpha-value>)',
        surface:         'rgb(var(--color-surface)         / <alpha-value>)',
        'surface-dim':   'rgb(var(--color-surface-dim)     / <alpha-value>)',
        'surface-bright':'rgb(var(--color-surface-bright)  / <alpha-value>)',
        'surface-cont':  'rgb(var(--color-surface-cont)    / <alpha-value>)',
        neutral:         'rgb(var(--color-neutral)         / <alpha-value>)',
        label:           'rgb(var(--color-label)           / <alpha-value>)',
        warning:         'rgb(var(--color-warning)         / <alpha-value>)',
        danger:          'rgb(var(--color-danger)          / <alpha-value>)',
        success:         'rgb(var(--color-success)         / <alpha-value>)',
        cyan:            'rgb(var(--color-cyan)            / <alpha-value>)',
        white:           'rgb(var(--color-white)           / <alpha-value>)',
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
