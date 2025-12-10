import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    proxy: {
      // This rule says: any request starting with "/api"
      // should be sent to your backend server.
      '/api': {
        target: 'http://localhost:8000', // Your backend's address
        // changeOrigin: true, // Recommended for virtual hosts
      }
    }
  }
})