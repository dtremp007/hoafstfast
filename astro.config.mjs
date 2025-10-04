// @ts-check
import { defineConfig, envField } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://www.hoafstfast.com",
  integrations: [sitemap(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      HYGRAPH_PERMANENT_AUTH_TOKEN: envField.string({
        access: "public",
        context: "client",
      }),
      HYGRAPH_ENDPOINT: envField.string({
        access: "public",
        context: "client",
      }),
    },
  },
});
