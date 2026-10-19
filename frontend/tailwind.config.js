/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { brand: { DEFAULT: '#c0392b', dark: '#962d22', soft: '#fdf1ef' }, paper: '#faf7f2' },
      boxShadow: { soft: '0 8px 28px -10px rgba(120, 53, 15, 0.22)' },
      keyframes: {
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pop: { '0%': { transform: 'scale(0.92)', opacity: '0' }, '60%': { transform: 'scale(1.03)', opacity: '1' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        slideIn: { '0%': { opacity: '0', transform: 'translateX(28px) scale(0.98)' }, '100%': { opacity: '1', transform: 'translateX(0) scale(1)' } },
        flicker: {
          '0%,100%': { transform: 'scale(1,1) rotate(0deg)' },
          '25%': { transform: 'scale(1.04,0.96) rotate(-1.5deg)' },
          '50%': { transform: 'scale(0.96,1.05) rotate(1deg)' },
          '75%': { transform: 'scale(1.02,0.99) rotate(-0.6deg)' },
        },
        ignite: {
          '0%': { transform: 'scale(0.15) translateY(30%)', opacity: '0', filter: 'brightness(2.2)' },
          '55%': { transform: 'scale(1.3) translateY(-4%)', opacity: '1', filter: 'brightness(1.5)' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1', filter: 'brightness(1)' },
        },
        glow: { '0%,100%': { opacity: '0.55', transform: 'scale(1)' }, '50%': { opacity: '0.9', transform: 'scale(1.15)' } },
        spark: {
          '0%': { transform: 'translate(0,0) scale(1)', opacity: '1' },
          '100%': { transform: 'translate(var(--x), -90px) scale(0)', opacity: '0' },
        },
        confetti: {
          '0%': { transform: 'translateY(-12vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(108vh) rotate(760deg)', opacity: '0.9' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0) scale(0.9)', opacity: '0' },
          '20%': { opacity: '1', transform: 'translateY(-8px) scale(1.1)' },
          '100%': { transform: 'translateY(-44px) scale(1)', opacity: '0' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' }, '20%': { transform: 'translateX(-7px)' }, '40%': { transform: 'translateX(7px)' },
          '60%': { transform: 'translateX(-4px)' }, '80%': { transform: 'translateX(4px)' },
        },
        shine: { '0%': { backgroundPosition: '0 0' }, '100%': { backgroundPosition: '28px 0' } },
        shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
        float: { '0%,100%': { transform: 'translateY(0) rotate(0deg)' }, '50%': { transform: 'translateY(-12px) rotate(2deg)' } },
      },
      animation: {
        'fade-up': 'fadeUp .45s ease-out backwards',
        pop: 'pop .35s ease-out backwards',
        'slide-in': 'slideIn .35s ease-out backwards',
        flicker: 'flicker 1.5s ease-in-out infinite',
        ignite: 'ignite 1s cubic-bezier(.2,.8,.2,1) both, flicker 1.5s ease-in-out 1s infinite',
        glow: 'glow 2s ease-in-out infinite',
        spark: 'spark 1.1s ease-out both',
        confetti: 'confetti 3.2s linear forwards',
        'float-up': 'floatUp 1s ease-out both',
        shake: 'shake .45s ease-in-out',
        float: 'float 7s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
