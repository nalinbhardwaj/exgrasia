module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './src/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'warning-yellowtext': '#f5a623',
        'warning-yellowbg': '#3A280C',
      },
      zIndex: {
        max: '9999',
      },
    },
  },
  plugins: [],
};
