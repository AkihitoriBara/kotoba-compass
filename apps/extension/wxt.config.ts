import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  manifest: {
    name: 'Kotoba Compass',
    description: 'Your AI Japanese Immersion Companion',
  },
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()] as never,
  }),
});

