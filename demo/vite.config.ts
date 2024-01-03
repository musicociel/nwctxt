import { svelte } from "@sveltejs/vite-plugin-svelte";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const root = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  root,
  plugins: [svelte()],
  resolve: {
    alias: [{ find: "nwctxt", replacement: join(root, "..", "src") }]
  }
});
