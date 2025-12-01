/// <reference types="node" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then(m =>
            m.cartographer()
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'client', 'src'),
      '@shared': path.resolve(import.meta.dirname, 'shared'),
      '@assets': path.resolve(import.meta.dirname, 'attached_assets'),
    },
  },
  root: path.resolve(import.meta.dirname, 'client'),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
    target: 'esnext',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    reportCompressedSize: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
      legalComments: 'none',
    },
    rollupOptions: {
      maxParallelFileOps: 1,
      output: {
        // Optimize chunking strategy for better memory usage
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Core React libraries
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'vendor-react';
            }
            if (id.includes('react-router')) {
              return 'vendor-react';
            }
            // UI component libraries
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            // Charting libraries (keep separate - large)
            if (id.includes('recharts') || id.includes('chart.js')) {
              return 'vendor-charts';
            }
            // Data fetching
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-tanstack';
            }
            if (id.includes('@tanstack/react-table')) {
              return 'vendor-tanstack';
            }
            // Form handling
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'vendor-forms';
            }
            // Icons (can be large)
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('react-icons')) {
              return 'vendor-icons';
            }
            // Animation
            if (id.includes('framer-motion')) {
              return 'vendor-animation';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            // All other dependencies
            return 'vendor';
          }
        },
        // Optimize chunk size
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ['**/.*'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
