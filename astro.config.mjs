// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  // PROTOTIP — domena (site) bo nastavljena ob objavi
  devToolbar: { enabled: false },
  // Strani ostanejo statične; strežnik potrebuje samo /api/povprasevanje (obrazca z datotekami).
  // Omejitev telesa: 5 datotek × 10 MB + polja.
  adapter: node({ mode: 'standalone', bodySizeLimit: 52 * 1024 * 1024 }),
});
