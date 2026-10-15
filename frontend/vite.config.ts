import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const { VITE_SITE_URL } = loadEnv(mode, process.cwd(), 'VITE_');
  const siteUrl = VITE_SITE_URL || 'https://prunty2.github.io/15values/';
  const socialImage = siteUrl ? new URL('social-preview.png', `${siteUrl.replace(/\/$/, '')}/`).href : './social-preview.png';
  return {
    plugins: [react(), {
      name: 'social-preview-metadata',
      transformIndexHtml(html: string) { return html.replaceAll('__SOCIAL_IMAGE_URL__', socialImage); },
    }],
    base: new URL(siteUrl).pathname.replace(/\/?$/, '/'),
  };
});
