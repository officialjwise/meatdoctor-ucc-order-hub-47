
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { UserConfig, ConfigEnv } from 'vite';

interface ServerProxy {
  '/api': {
    target: string;
    changeOrigin: boolean;
    secure: boolean;
    rewrite: (path: string) => string;
  };
}

interface ServerConfig {
  host: string;
  port: number;
  proxy: ServerProxy;
}

interface ResolveConfig {
  alias: {
    [key: string]: string;
  };
}

export default defineConfig(({ mode }: ConfigEnv): UserConfig => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/api/, '/api'), 
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'process.env.PAYSTACK_PUBLIC_KEY': JSON.stringify(process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_b2c3ae1064ed15226bdf5260ea65e70080e2f1a2'),
  },
}));
