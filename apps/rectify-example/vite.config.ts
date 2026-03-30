import { defineConfig } from "vite";
import rectify from "@rectify-dev/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [rectify()],
  // Serve index.html for all routes so BrowserRouter handles them on refresh
  appType: "spa",
  server: {
    port: 5174,
  },
});
