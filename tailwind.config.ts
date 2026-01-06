import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms';

export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx,html}',
    './index.html'
  ],
  theme: {
    extend: {
      colors: {
        'brand-green': {
          DEFAULT: '#059669', // green-600
          'light': '#ecfdf5',  // green-50
          'dark': '#047857',   // green-700
          'darker': '#065f46'  // green-800
        },
        'brand-gray': {
          DEFAULT: '#6b7280',  // gray-500
          'light': '#e5e7eb',  // gray-200
          'dark': '#374151'    // gray-700
        }
      },
      fontFamily: { // Tùy chọn: thêm font chữ nếu muốn
        sans: ['Inter', 'sans-serif'], // Thay 'Inter' bằng font bạn thích
      },
    },
  },
  plugins: [
    // Thêm các plugin Tailwind nếu cần, ví dụ: @tailwindcss/forms
    forms,
  ],
} satisfies Config