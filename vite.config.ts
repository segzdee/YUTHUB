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
    chunkSizeWarningLimit: 500,
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
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Group by package size and usage patterns for optimal memory usage

            // Core React (always needed - small bundle)
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('scheduler')) {
              return 'vendor-react';
            }

            // Router (loaded early)
            if (id.includes('react-router')) {
              return 'vendor-router';
            }

            // UI Framework - Split Radix into smaller chunks by component type
            if (id.includes('@radix-ui/react-dialog') ||
                id.includes('@radix-ui/react-alert-dialog') ||
                id.includes('@radix-ui/react-popover') ||
                id.includes('@radix-ui/react-dropdown-menu')) {
              return 'vendor-radix-overlay';
            }
            if (id.includes('@radix-ui/react-select') ||
                id.includes('@radix-ui/react-tabs') ||
                id.includes('@radix-ui/react-accordion') ||
                id.includes('@radix-ui/react-collapsible')) {
              return 'vendor-radix-interactive';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-radix-core';
            }

            // Charts - Heavy, load on demand
            if (id.includes('recharts')) {
              return 'vendor-recharts';
            }
            if (id.includes('d3-') || id.includes('victory')) {
              return 'vendor-d3';
            }

            // Data fetching and state
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            if (id.includes('@tanstack/react-table')) {
              return 'vendor-table';
            }
            if (id.includes('zustand')) {
              return 'vendor-state';
            }

            // Form libraries (loaded on form pages)
            if (id.includes('react-hook-form')) {
              return 'vendor-forms-rhf';
            }
            if (id.includes('@hookform') || id.includes('zod')) {
              return 'vendor-forms-validation';
            }

            // Icons - Split by library
            if (id.includes('lucide-react')) {
              return 'vendor-icons-lucide';
            }
            if (id.includes('react-icons')) {
              return 'vendor-icons-react';
            }
            if (id.includes('@radix-ui/react-icons')) {
              return 'vendor-icons-radix';
            }

            // Animation (loaded on pages with animations)
            if (id.includes('framer-motion')) {
              return 'vendor-animation';
            }

            // Backend integration
            if (id.includes('@supabase/supabase-js')) {
              return 'vendor-supabase';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase-ui';
            }

            // Date utilities
            if (id.includes('date-fns')) {
              return 'vendor-date';
            }

            // Utility libraries
            if (id.includes('lodash') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'vendor-utils';
            }

            // All other small dependencies
            return 'vendor-misc';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        experimentalMinChunkSize: 20000,
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
