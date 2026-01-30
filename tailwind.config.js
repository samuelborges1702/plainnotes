/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/**/*.{js,ts,jsx,tsx,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base colors (Mono)
        bg: {
          base: '#141414',
          elevated: '#1a1a1a',
          surface: '#1f1f1f',
          hover: '#2a2a2a',
          active: '#333333',
        },
        text: {
          primary: '#e5e5e5',
          secondary: '#a3a3a3',
          muted: '#666666',
          disabled: '#444444',
        },
        border: {
          subtle: '#2a2a2a',
          default: '#333333',
          strong: '#404040',
        },
        // Vivid Accents
        accent: {
          cyan: '#00d4ff',
          magenta: '#ff3399',
          green: '#00ff88',
          yellow: '#ffcc00',
          purple: '#aa77ff',
          orange: '#ff7744',
        },
        // Semantic
        status: {
          success: '#00ff88',
          warning: '#ffcc00',
          error: '#ff4466',
          info: '#00d4ff',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['11px', '16px'],
        sm: ['12px', '18px'],
        base: ['14px', '22px'],
        lg: ['16px', '24px'],
        xl: ['18px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['32px', '40px'],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 200ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
