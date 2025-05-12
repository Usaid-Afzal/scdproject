import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env': env,
    },
    server: {
      host: '0.0.0.0',           // Listen on all interfaces (for Docker/Minikube)
      port: 5173,                // Optional: explicitly set dev server port
      strictPort: true,          // Don't fall back to another port
      allowedHosts: ['purrfectmatch.local', 'localhost'], // 👈 Allow external hostname
    },
  };
});
