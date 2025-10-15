import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import checker from "vite-plugin-checker";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss(), checker({ typescript: true })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
