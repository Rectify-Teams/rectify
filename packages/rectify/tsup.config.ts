import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],

  format: ["esm", "cjs"],
  target: "ES2020",

  dts: true,
  sourcemap: true,
  bundle: true,
  splitting: true,

  treeshake: true,
  minify: false,
  keepNames: true,
  clean: true,
});
