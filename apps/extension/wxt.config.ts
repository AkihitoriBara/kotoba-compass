import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  manifest: {
    name: 'Kotoba Compass',
    permissions: ['storage'],
    description: 'Your AI Japanese Immersion Companion',
    web_accessible_resources: [
      {
        resources: ['dictionaries/**/*'],
        matches: ['<all_urls>'],
      },
    ],
  },
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    envDir: path.resolve(__dirname, '../'),
    envPrefix: ['VITE_', 'WXT_', 'GEMINI_'],
    plugins: [tailwindcss()],
  }),
});
