import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    // Served from the domain root on Vercel.
    base: "/",
    server: {
      port: 3000,
      host: "0.0.0.0",
      // Dev only: proxies /api to the local backend so no absolute URL is
      // needed. In production VITE_API_BASE_URL points straight at Render.
      proxy: {
        "/api": {
          target: env.DEV_API_PROXY || "http://localhost:5002",
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 3000,
      host: "0.0.0.0",
    },
    plugins: [react()],
    build: {
      outDir: "dist",
      sourcemap: false,
      chunkSizeWarningLimit: 1200,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
