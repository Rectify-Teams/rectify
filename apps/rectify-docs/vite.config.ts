import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import rectify from "@rectify-dev/vite-plugin";

export default defineConfig({
  plugins: [tailwindcss(), rectify()],
  appType: "spa",
  server: { port: 5200 },
});
