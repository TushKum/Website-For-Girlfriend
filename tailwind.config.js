/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // The premium gallery palette.
        obsidian: '#050505',
        midnight: '#0c0c0f',
        champagne: '#ffe4e1',
        'rose-gold': '#e8c3b9',
        amber: {
          glow: '#ffba6b',
        },
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
