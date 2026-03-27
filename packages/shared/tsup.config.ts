import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  target: "ES2020",
  outExtension({ format }) {
    return { js: format === "esm" ? ".js" : ".cjs" };
  },
  dts: true,
  sourcemap: true,
  bundle: true,
  treeshake: true,
  minify: false,
  keepNames: true,
  clean: true,
});
