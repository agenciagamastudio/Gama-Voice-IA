import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'gama-primary': 'var(--color-primary)',
        'gama-dark': 'var(--color-bg-primary)',
        'gama-darker': 'var(--color-bg-secondary)',
        'gama-surface': 'var(--color-surface-default)',
        'gama-surface-accent': 'var(--color-surface-hover)',
        'gama-text': 'var(--color-text-primary)',
        'gama-text-secondary': 'var(--color-text-secondary)',
        'gama-text-tertiary': 'var(--color-text-tertiary)',
        'gama-text-muted': 'var(--color-text-muted)',
        'gama-success': 'var(--color-success)',
        'gama-warning': 'var(--color-warning)',
        'gama-error': 'var(--color-error)',
        'gama-info': 'var(--color-info)',
        'gama-border-default': 'var(--color-border-default)',
        'gama-border-hover': 'var(--color-border-hover)',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        'jetbrains-mono': ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        display: ['48px', { lineHeight: '1.2', fontWeight: '900', letterSpacing: '-0.5px' }],
        '3xl': ['36px', { lineHeight: '1.25', fontWeight: '800', letterSpacing: '-0.25px' }],
        '2xl': ['24px', { lineHeight: '1.33', fontWeight: '700', letterSpacing: '0px' }],
        xl: ['20px', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0px' }],
        base: ['16px', { lineHeight: '1.5', fontWeight: '500', letterSpacing: '0px' }],
        sm: ['14px', { lineHeight: '1.43', fontWeight: '400', letterSpacing: '0.25px' }],
        xs: ['12px', { lineHeight: '1.33', fontWeight: '400', letterSpacing: '0.5px' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
        '5xl': '96px',
        '6xl': '128px',
        '7xl': '160px',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
      },
      boxShadow: {
        sm: '0 2px 4px rgba(0, 0, 0, 0.2)',
        md: '0 4px 12px rgba(0, 0, 0, 0.3)',
        lg: '0 8px 24px rgba(0, 0, 0, 0.4)',
      },
      transitionDuration: {
        fast: '150ms',
        standard: '300ms',
        slow: '500ms',
      },
    },
  },
  plugins: [],
}
export default config
