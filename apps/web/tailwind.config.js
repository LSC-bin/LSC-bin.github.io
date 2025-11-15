/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecf5fe',
          100: '#d7e6fc',
          200: '#aecdf9',
          300: '#7db3f5',
          400: '#4c98ef',
          500: '#157ce8',
          600: '#1062c4',
          700: '#0d4c9a',
          800: '#09356f',
          900: '#061f45',
        },
        surface: {
          950: '#05060f',
          900: '#0b1220',
          800: '#111a2d',
          700: '#152036',
          600: '#1b2945',
        },
      },
      fontFamily: {
        sans: ['"Pretendard Variable"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 45px -25px rgba(15, 118, 110, 0.45)',
        panel: '0 25px 50px -25px rgba(15, 110, 200, 0.35)',
      },
    },
  },
  plugins: [],
}

