import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import rectify from "@rectify-dev/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  // In CI the VITE_BASE env variable is set to the sub-path where the app
  // will be served (e.g. /rectify/perf-benchmark/). Locally it defaults to
  // "/" so the dev server works without any extra configuration.
  base: process.env["VITE_BASE"] ?? "/",
  plugins: [
    // Apply React Babel transform only to files ending in .react.tsx / .react.ts
    react({ include: /\.react\.[jt]sx?$/ }),
    // Apply Rectify Babel transform to all other .tsx / .ts files
    rectify({ exclude: /\.react\.[jt]sx?$/ }),
  ],
  server: {
    port: 5175,
  },
});
