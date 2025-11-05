import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// URL base dinámica según entorno
const backendUrl =
  process.env.VITE_API_URL || "http://localhost:4000";

export default defineConfig({
  plugins: [react()],
  define: {
    "import.meta.env.VITE_API_URL": JSON.stringify(backendUrl),
  },
  server: {
    proxy: {
      "/api": {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
