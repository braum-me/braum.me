import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  site: "https://braum.me",
  integrations: [
    sitemap({
      customPages: ["https://braum.me/", "https://braum.me/mail"],
      filter: (page) => page === "https://braum.me/" || page === "https://braum.me/mail",
      serialize(item) {
        if (item.url === "https://braum.me/") {
          return { ...item, changefreq: "weekly", priority: 1.0, lastmod: new Date() };
        }
        return { ...item, changefreq: "monthly", priority: 0.6, lastmod: new Date() };
      },
    }),
  ],
  server: {
    host: true,
    port: 4321,
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssMinify: "lightningcss",
    },
  },
  compressHTML: true,
  build: {
    inlineStylesheets: "auto",
  },
  experimental: {
    clientPrerender: true,
  },
});
