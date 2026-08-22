import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@/components': path.resolve(import.meta.dirname, './src/components'),
      '@/services': path.resolve(import.meta.dirname, './src/services'),
      '@/hooks': path.resolve(import.meta.dirname, './src/hooks'),
      '@/types': path.resolve(import.meta.dirname, './src/types'),
      '@/api': path.resolve(import.meta.dirname, './src/api'),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@tanstack/react-query')) return 'query-vendor';
            if (id.includes('axios')) return 'axios-vendor';
            if (id.includes('lucide-react')) return 'icons-vendor';
            if (id.includes('react')) return 'react-vendor';
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.js',
  },
})
