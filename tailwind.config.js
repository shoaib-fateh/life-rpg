// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      willChange: [
        "transform",
        "opacity",
        "background-position",
        "text-shadow",
      ],
    },
  },
  plugins: [],
};
