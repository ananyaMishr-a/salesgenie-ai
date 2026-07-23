/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0B1220', // app shell background (matches dark header bar in mockups)
          panel: '#FFFFFF',
          sunken: '#F6F8FB',
          border: '#E4E9F1',
        },
        brand: {
          DEFAULT: '#3B6CF6', // primary blue accent (Outreach button, score ring)
          dark: '#2451D6',
          soft: '#EAF0FE',
        },
        accent: {
          purple: '#7C5CFC', // "AI Powered" pill
          green: '#1FA971', // qualification / positive signals
          amber: '#E3A02B', // medium priority
        },
        ink: {
          DEFAULT: '#0F1A2E',
          muted: '#5B6B85',
          faint: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '14px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 26, 46, 0.06), 0 4px 16px rgba(15, 26, 46, 0.04)',
      },
    },
  },
  plugins: [],
}
