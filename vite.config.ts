import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig({
  plugins: [
    TanStackRouterVite({ routesDirectory: "./src/routes", generatedRouteTree: "./src/routeTree.gen.ts" }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes("/routes/admin")) return "admin";
          if (id.includes("framer-motion")) return "framer-motion";
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) return "react-core";
          if (id.includes("@tanstack/react-router") || id.includes("@tanstack/react-start")) return "router";
        },
      },
    },
    target: "es2020",
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 500,
  },
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
      process.env.VITE_SUPABASE_URL ?? "https://cemvklfruuuzhhvzrbrb.supabase.co"
    ),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjZW12a2xmcnV1dXpoaHZ6cmJyYiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc4NjU4NTM4LCJleHAiOjIwOTQyMzQ1Mzh9.kcycRWTB7TH6hnx9Y-NOkOMQBhpjAHADl_-P7Y47nzM"
    ),
    "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(
      process.env.VITE_SUPABASE_PROJECT_ID ?? "cemvklfruuuzhhvzrbrb"
    ),
  },
});
