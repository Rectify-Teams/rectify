import type { Plugin } from "vite";
import babel from "vite-plugin-babel";
import rectifyBabelTransform from "@rectify/babel-transform-rectify-jsx";

export interface RectifyPluginOptions {
  /** Glob/regex filter for files to transform. Defaults to /\.[jt]sx$/ */
  include?: string | RegExp | (string | RegExp)[];
  /** Glob/regex patterns to exclude from transformation. */
  exclude?: string | RegExp | (string | RegExp)[];
}

export default function rectify(options: RectifyPluginOptions = {}): Plugin {
  const { include, exclude } = options;

  return babel({
    filter: /\.[jt]sx$/,
    include,
    exclude,
    babelConfig: {
      plugins: [rectifyBabelTransform],
    },
  }) as Plugin;
}
