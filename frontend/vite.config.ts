import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [
    figmaAssetResolver(),
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom', 'react-router'],
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    target: 'es2020',
    sourcemap: mode === 'development',
    minify: 'esbuild',
    cssMinify: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      treeshake: {
        preset: 'safest',
      },
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'js/[name]-[hash]-v2.js',
        entryFileNames: 'js/[name]-[hash]-v2.js',
        // Keep recharts + ALL its d3 dependencies, AND every lazy-loaded
        // admin/dashboard component, together in ONE chunk.
        //
        // Why: Vite/Rollup's automatic code-splitting can place a component
        // that doesn't even import recharts (e.g. BallotScanSystem) into a
        // chunk that ends up with a circular load-order dependency on the
        // recharts vendor chunk, because some sibling lazy component in the
        // same dashboard shares an internal module with both. The result is
        // a "Cannot access X before initialization" TDZ crash at runtime
        // that only appears in production builds, not dev.
        //
        // The reliable fix is to remove the chunk boundary between these
        // modules entirely — intra-chunk circular references are handled
        // correctly by Rollup via hoisting + live bindings; only CROSS-chunk
        // circular dependencies break with this error.
        manualChunks(id) {
          if (
            id.includes('node_modules/recharts') ||
            id.includes('node_modules/d3-') ||
            id.includes('node_modules/d3/') ||
            id.includes('node_modules/internmap') ||
            id.includes('node_modules/robust-predicates') ||
            id.includes('node_modules/victory-vendor') ||
            id.includes('/app/components/') ||
            id.includes('/app/pages/dashboards/')
          ) {
            return 'admin-bundle';
          }
        },
      },
    },
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router',
      'recharts',
      'lucide-react',
      'sonner',
      'clsx',
      'tailwind-merge',
    ],
    exclude: ['@vitejs/plugin-react'],
  },

  server: {
    port: 3000,
    strictPort: false,
    hmr: { overlay: true },
    proxy: {
      '/make-server-8fca9621': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },

  preview: {
    port: 4173,
    strictPort: false,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },

  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __APP_NAME__: JSON.stringify('Build One Zambia Election Portal'),
  },
}))
