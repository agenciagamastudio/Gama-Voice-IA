/**
 * Design System Tokens - GAMA V3
 * Cores, spacing, tipografia, efeitos
 * Integrado com Tailwind CSS v4
 */

export const colors = {
  // Primary (Neon Green)
  primary: 'var(--primary)',
  primaryDim: 'var(--primary-dim)',
  primaryGlow: 'var(--primary-glow)',

  // Backgrounds
  bg: 'var(--bg)',
  surface: 'var(--surface)',
  surface2: 'var(--surface-2)',
  surface3: 'var(--surface-3)',

  // Borders
  border: 'var(--border)',
  borderGreen: 'var(--border-green)',

  // Text
  text: 'var(--text)',
  text2: 'var(--text-2)',
  text3: 'var(--text-3)',

  // Semantic
  success: 'var(--success)',
  warning: 'var(--warning)',
  error: 'var(--error)',
  info: 'var(--info)',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
};

export const radius = {
  default: 'var(--radius)',
  sm: 'var(--radius-sm)',
};

export const typography = {
  fontSans: 'var(--font-sans, Poppins, sans-serif)',
  fontMono: 'var(--font-mono, "JetBrains Mono", monospace)',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
};

export const animations = {
  fadeUp: 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
  pulseGreen: 'pulseGreen 3s ease-in-out infinite',
  spinSlow: 'spin 8s linear infinite',
  shimmer: 'shimmer 3s linear infinite',
};
