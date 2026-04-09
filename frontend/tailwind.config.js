/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#88CE11',
        dark: '#161616',
        surface: '#272727'
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system']
      }
    }
  },
  plugins: []
}
