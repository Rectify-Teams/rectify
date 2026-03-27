import { defineConfig } from "vite";
import rectify from "@rectify-dev/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [rectify()],
  server: {
    port: 5174,
  },
});
