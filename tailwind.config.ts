/**
 * DEPRECATED - Tailwind v4 does not read this file by default.
 *
 * Brand tokens were migrated to `src/index.css` with the @theme directive
 * on 2026-05-26. Keep this file only as reference and rollback insurance.
 *
 * If a new color/font token is needed, edit `src/index.css` @theme block.
 * Do not treat this file as the runtime source of truth.
 */
import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

// Reference only. Runtime source of truth: src/index.css @theme block.
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}', './index.html'],
  theme: {
    extend: {
      colors: {
        'brand-green': {
          DEFAULT: '#059669',
          light: '#ecfdf5',
          medium: '#10b981',
          dark: '#047857',
          darker: '#065f46',
        },
        'brand-gray': {
          DEFAULT: '#6b7280',
          light: '#e5e7eb',
          dark: '#374151',
        },
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [forms],
} satisfies Config;
