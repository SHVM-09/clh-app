import { defineConfig } from 'vitest/config';
import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';

// ⬇️ Replace this with your current ngrok host if it changes
const NGROK_HOST = 'leonia-unpurposing-periosteally.ngrok-free.dev';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit(), devtoolsJson()],

  // ✅ Allow Vite dev server to accept requests from your ngrok tunnel
  server: {
    host: true,
    cors: true,
    allowedHosts: [
      '*.ngrok-free.app',
      '*.ngrok-free.dev',
      NGROK_HOST
    ],
    // helps HMR behind HTTPS tunnels
    hmr: { clientPort: 443 }
  },

  // (optional) same relaxations for `pnpm preview`
  preview: {
    host: true,
    allowedHosts: [
      '*.ngrok-free.app',
      '*.ngrok-free.dev',
      NGROK_HOST
    ]
  },

  test: {
    expect: { requireAssertions: true },
    projects: [
      {
        extends: './vite.config.ts',
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.{test,spec}.{js,ts}'],
          exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
        }
      }
    ]
  }
});
