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
  "/site.webmanifest",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png",
  "/web-app-manifest-maskable-512x512.png",
];

// Tanpa pengelompokan, satu halaman meminta puluhan file JS kecil dan tiap file dihitung sebagai satu CDN request.
// Hati-hati mengubah grup: "entriesAware" tanpa batas ke paket tertentu pernah membuat halaman error saat dimuat.
const CHUNK_GROUPS = [
  {
    name: "core",
    test: /node_modules[\\/](react|react-dom|scheduler|@tanstack|@radix-ui|@floating-ui|@orpc|motion|framer-motion|motion-dom|motion-utils|better-auth|better-call|nanostores)[\\/]/,
  },
  { name: "icons", test: /@phosphor-icons/, entriesAware: true, entriesAwareMergeThreshold: 60_000 },
];

export default defineConfig({
  server: {
    port: Number(process.env.PORT || 3000),
  },
  resolve: {
    tsconfigPaths: true,
  },
  environments: {
    client: { build: { rolldownOptions: { output: { codeSplitting: { groups: CHUNK_GROUPS } } } } },
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
