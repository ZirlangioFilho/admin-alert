import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  /** Garante pré-bundle do router (evita falha de resolução se o cache do Vite estiver estranho). */
  optimizeDeps: {
    include: ["react-router", "react-router-dom"],
  },
})
