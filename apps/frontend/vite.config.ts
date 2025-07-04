import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
<<<<<<< HEAD
import path from 'path';
=======
>>>>>>> 9ee913167a2d6a89eff541e3f79d80bd6c0c6e3d

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
  },
<<<<<<< HEAD
  resolve: {
    alias: {
      '@shared/types': path.resolve(__dirname, '../../shared/types/src'),
    },
=======
  optimizeDeps: {
    exclude: ['lucide-react'],
>>>>>>> 9ee913167a2d6a89eff541e3f79d80bd6c0c6e3d
  },
});
