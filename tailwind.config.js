/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Soft, ethereal, deeply romantic palette.
        blush: '#ffdde6',
        petal: '#ffc6d5',
        peach: '#ffe0cf',
        champagne: '#fbe6d4',
        cream: '#fff7f3',
        'rose-gold': {
          DEFAULT: '#c98b7e',
          deep: '#a86a5f',
          light: '#e6b9ad',
        },
        // Legacy token kept for any stray reference.
        obsidian: '#0c0a0b',
      },
      fontFamily: {
        // Elegant serif for the editorial memory copy.
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        // Clean sans for UI chrome.
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xl: '24px',
      },
      transitionTimingFunction: {
        // A weighty, luxurious easing curve.
        lux: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 1.2s ease-out both',
        'fade-up': 'fade-up 1s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
