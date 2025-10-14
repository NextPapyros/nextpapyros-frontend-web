export default {
  content: ["./index.html", "./src/**/*.{vue,ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Principal
        brand: {
          soft: "#A3EBB1", // Suave
          base: "#18A558", // Base
          intense: "#116530", // Intenso
        },
        // Complementario
        accent: {
          soft: "#58DBCE",
          base: "#21B6A8",
          intense: "#106B63",
        },
        // Oscuros neutros
        dark: {
          soft: "#616161",
          base: "#333333",
          intense: "#050505",
        },
        // Claros neutros
        light: {
          soft: "#C1C1C1",
          base: "#EFEFEF",
          intense: "#FFFFFF",
        },
        // Estados de error
        error: {
          soft: "#F3989B",
          base: "#EF4444",
          intense: "#CC0C0C",
        },
      },
    },
  },
  plugins: [],
};
