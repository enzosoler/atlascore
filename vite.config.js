import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

function manualChunks(id) {
  if (id.includes('/src/i18n/messages/') || id.includes('/src/i18n/patches/')) {
    return 'i18n-dictionaries'
  }

  if (id.includes('/src/data/regionalPricing.json')) {
    return 'regional-pricing-data'
  }

  if (!id.includes('node_modules')) return

  if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) {
    return 'vendor-react'
  }

  if (id.includes('/react-router/') || id.includes('/react-router-dom/')) {
    return 'vendor-router'
  }

  if (id.includes('/@supabase/')) {
    return 'vendor-supabase'
  }

  if (
    id.includes('/@capacitor/') ||
    id.includes('/@revenuecat/')
  ) {
    return 'vendor-native'
  }

  if (
    id.includes('/recharts/') ||
    id.includes('/d3-')
  ) {
    return 'vendor-charts'
  }

  if (
    id.includes('/html2canvas/') ||
    id.includes('/jspdf/')
  ) {
    return 'vendor-export'
  }

  if (id.includes('/react-markdown/')) {
    return 'vendor-markdown'
  }

  if (id.includes('/posthog-js/')) {
    return 'vendor-posthog'
  }

  if (id.includes('/@sentry/')) {
    return 'vendor-sentry'
  }

  if (id.includes('/@tanstack/')) {
    return 'vendor-query'
  }

  if (id.includes('/sonner/')) {
    return 'vendor-sonner'
  }

  if (id.includes('/lucide-react/')) {
    return 'vendor-icons'
  }

  if (id.includes('/zod/')) {
    return 'vendor-zod'
  }

  if (id.includes('/tailwind-merge/')) {
    return 'vendor-tailwind'
  }

  if (id.includes('/@radix-ui/')) {
    return 'vendor-radix'
  }

  if (
    id.includes('/framer-motion/') ||
    id.includes('/embla-carousel-react/')
  ) {
    return 'vendor-motion'
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  // Fail the build early when critical Supabase env vars are missing.
  // loadEnv reads .env / .env.local / .env.[mode] so the check sees real values.
  if (command === 'build') {
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    const url = env.VITE_SUPABASE_URL;
    const key = env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      throw new Error(
        '[atlas.core] Production build requires Supabase env vars.\n' +
        'Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local\n' +
        'See .env.example for required variables.'
      );
    }
  }

  return {
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Let the existing public/manifest.json be used as-is
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        // Skip SW on Capacitor native — navigateFallback only for web
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          // Supabase API calls — fresh when online, cached when offline
          {
            urlPattern: /^https:\/\/.*supabase.*\/rest\/v1\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 100, maxAgeSeconds: 300 },
            },
          },
          // Supabase storage (avatars, progress photos, etc.)
          {
            urlPattern: /^https:\/\/.*supabase.*\/storage\/v1\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'storage-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          // Images
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          // Google Fonts stylesheets
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          // Google Fonts webfont files
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  base: '/',
  server: {
    host: true, // listen on all interfaces so phones on the same Wi-Fi can reach the dev server
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    strictPort: false,
    // Allow any ngrok subdomain (free + paid) + any localtunnel / Cloudflare tunnel / LAN IP.
    // The leading "." means "any subdomain of", e.g. briskness-bunny-apply.ngrok-free.dev
    allowedHosts: [
      'localhost',
      '.ngrok-free.dev',
      '.ngrok-free.app',
      '.ngrok.io',
      '.trycloudflare.com',
      '.loca.lt',
    ],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
  };
});
