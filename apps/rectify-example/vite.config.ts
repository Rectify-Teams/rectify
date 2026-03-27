import { defineConfig } from "vite";
import babel from "vite-plugin-babel";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5174,
  },
  plugins: [
    babel({
      babelConfig: {
        plugins: [
          [
            "@babel/plugin-transform-react-jsx",
            {
              pragma: "jsx",
              pragmaFrag: "Fragment",
            },
          ],
        ],
      },
    }),
  ],
});
