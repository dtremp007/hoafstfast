// @ts-check
import { defineConfig, envField } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

import react from "@astrojs/react";

import vercel from "@astrojs/vercel";

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
        access: "secret",
        context: "server",
      }),
      HYGRAPH_ENDPOINT: envField.string({
        access: "secret",
        context: "server",
      }),
    },
  },

  adapter: vercel(),
});
