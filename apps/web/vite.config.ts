import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

// File di public/ namanya tetap, jadi jangan "immutable": gambar yang diganti harus ikut terbarui dalam 7 hari.
const IMAGE_CACHE = { headers: { "cache-control": "public, max-age=604800, stale-while-revalidate=86400" } };

const CACHED_PUBLIC_PATHS = [
  "/avatar/**",
  "/decorations/**",
  "/icons/**",
  "/images/**",
  "/mentor/**",
  "/apple-touch-icon.png",
  "/dashboard-background.webp",
  "/event-placeholder.svg",
  "/favicon.ico",
  "/logo.svg",
  "/logo.webp",
  "/og-image.png",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png",
  "/web-app-manifest-maskable-512x512.png",
];

export default defineConfig({
  server: {
    port: Number(process.env.PORT || 3000),
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    nitro({
      routeRules: Object.fromEntries(CACHED_PUBLIC_PATHS.map((path) => [path, IMAGE_CACHE])),
      vercel: {
        functions: {
          runtime: "bun1.x",
        },
      },
    }),
    viteReact(),
  ],
});
