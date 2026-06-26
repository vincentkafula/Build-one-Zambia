import { defineConfig, splitVendorChunkPlugin } from 'vite'
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
    splitVendorChunkPlugin(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom', 'react-router'],
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],

  // Production build optimizations
  build: {
    target: 'es2020',
    sourcemap: mode === 'development',
    minify: 'esbuild',
    cssMinify: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Split large vendor chunks for better caching
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Recharts in its own chunk (large)
            if (id.includes('recharts') || id.includes('d3-')) return 'charts';
            // MUI in its own chunk
            if (id.includes('@mui') || id.includes('@emotion')) return 'mui';
            // Radix UI primitives
            if (id.includes('@radix-ui')) return 'radix';
            // React core
            if (id.includes('react-dom') || id.includes('react-router')) return 'react';
            // Everything else vendor
            return 'vendor';
          }
        },
        // Cache-friendly asset naming
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'js/[name]-[hash]-v2.js',
        entryFileNames: 'js/[name]-[hash]-v2.js',
      },
    },
  },

  // Dependency pre-bundling optimizations
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

  // Server settings (dev)
  server: {
    port: 3000,
    strictPort: false,
    hmr: { overlay: true },
    // Proxy API calls to the Node.js backend in development
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

  // Preview settings (production preview)
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

  // Environment variable definitions available everywhere
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __APP_NAME__: JSON.stringify('Build One Zambia Election Portal'),
  },
}))
