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

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    host: true, // Permite escuta em 0.0.0.0 e exposição no GitHub Codespaces / Docker
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/docs': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        bypass(req) {
          // Se a requisição for para arquivos estáticos (.md, .txt, etc.) ou subpastas de documentação, o Vite serve de public/
          if (
            req.url &&
            (req.url.startsWith('/docs/pi') ||
              req.url.startsWith('/docs/assets') ||
              req.url.endsWith('.md') ||
              req.url.endsWith('.txt'))
          ) {
            return req.url;
          }
        },
      },
      '/openapi.json': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
