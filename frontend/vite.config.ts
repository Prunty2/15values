import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const { VITE_SITE_URL } = loadEnv(mode, process.cwd(), 'VITE_');
  const socialImage = VITE_SITE_URL ? new URL('social-preview.png', `${VITE_SITE_URL.replace(/\/$/, '')}/`).href : './social-preview.png';
  return {
    plugins: [react(), {
      name: 'social-preview-metadata',
      transformIndexHtml(html: string) { return html.replaceAll('__SOCIAL_IMAGE_URL__', socialImage); },
    }],
    base: './',
  };
});
