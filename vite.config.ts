// @lovable.dev/vite-tanstack-config already includes the core Vite/TanStack plugins.
// Do not add duplicate React, Router, Tailwind or path-alias plugins manually.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import fs from "node:fs";
import path from "node:path";

const CITY_SLUGS = [
  "perm","krasnokamsk","berezniki","solikamsk","chaykovskiy",
  "kungur","lysva","chusovoy","dobryanka","osa","nytva",
  "vereshchagino","perm-rayon",
];

const SERVICE_SLUGS = [
  "asfaltirovanie","trotuarnaya-plitka","yamochnyy-remont",
  "zemlyanye-raboty","demontazh","vyvoz-musora","arenda-spetstekhniki",
  "dostavka-nerudnykh","uborka-snega","stroitelstvo-dorog",
  "remont-dorog","kronirovanie-derevyev",
];

const STATIC_PAGES = [
  "/", "/services", "/goroda", "/tseny",
  "/portfolio", "/blog", "/about", "/contacts",
  ...CITY_SLUGS.map((s) => `/goroda/${s}`),
  ...SERVICE_SLUGS.map((s) => `/services/${s}`),
];

export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    spa: { enabled: true, prerender: { outputPath: "/_shell" } },
    prerender: { enabled: true, failOnError: false },
    sitemap: { enabled: false },
    pages: STATIC_PAGES.map((p) => ({
      path: p,
      prerender: { enabled: true, crawlLinks: false, retryCount: 2 },
    })),
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            // Admin — грузится только при входе в /admin
            if (id.includes("/routes/admin")) return "admin";
            // Анимации — тяжёлый пакет, отдельный чанк
            if (id.includes("framer-motion")) return "framer-motion";
            // Графики — только на странице цен
            if (id.includes("recharts") || id.includes("d3-")) return "charts";
            // Radix UI — отдельно от основного бандла
            if (id.includes("@radix-ui")) return "radix";
            // Supabase SDK
            if (id.includes("@supabase")) return "supabase";
            // React core
            if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) return "react-core";
            // TanStack Router
            if (id.includes("@tanstack/react-router") || id.includes("@tanstack/react-start")) return "router";
          },
        },
      },
      // ES2020 — меньше полифиллов, браузеры 2020+ поддерживают 98% пользователей РФ
      target: "es2020",
      // Инлайнить маленькие ассеты (<4KB) напрямую в JS
      assetsInlineLimit: 4096,
      // CSS code splitting — каждый чанк получает только нужный CSS
      cssCodeSplit: true,
      // Sourcemaps только для продакшн-дебага (не влияет на производительность)
      sourcemap: false,
      // Минимальный размер чанка для разбиения
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
    plugins: [
      {
        // TanStack's SPA prerender may expect server.js while the build emits index.js.
        name: "lovable-mirror-ssr-entry",
        apply: "build",
        closeBundle() {
          const src = path.resolve("dist/server/index.js");
          const dest = path.resolve("dist/server/server.js");
          if (fs.existsSync(src) && !fs.existsSync(dest)) {
            fs.copyFileSync(src, dest);
          }
        },
      },
    ],
  },
});
