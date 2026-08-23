import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server runs on port 5173. Add this URL as a redirect URI in your
// Entra "SPA" app registration:  http://localhost:5173
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }
});
