/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0000FF',
        'secondary-yellow': '#FEEA45',
        'secondary-blue': '#8AE1F4',
        'secondary-lavender': '#F4F4FF',
      },
    },
  },
  plugins: [],
}

