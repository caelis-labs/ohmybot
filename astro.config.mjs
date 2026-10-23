import { defineConfig } from 'astro/config';
import { localDownloads } from './scripts/local-downloads.mjs';
export default defineConfig({
  site: 'https://ohmybot.si', output: 'static', trailingSlash: 'always',
  vite: { plugins: [localDownloads()] },
});
