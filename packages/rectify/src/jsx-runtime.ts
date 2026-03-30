import type { RectifyIntrinsicElements, HTMLAttributes } from "@rectify-dev/shared";

export { jsx, Fragment } from "./RectifyJsx";
// jsxs is the multi-children variant — identical to jsx since children are already in props
export { jsx as jsxs } from "./RectifyJsx";

// TypeScript reads this namespace when tsconfig has:
//   "jsx": "react-jsx", "jsxImportSource": "@rectify-dev/core"
export namespace JSX {
  export type Element = any;
  export type IntrinsicElements = RectifyIntrinsicElements & {
    [elemName: string]: HTMLAttributes;
  };
  export interface ElementChildrenAttribute {
    children: {};
  }
  /** Props accepted on every element (host and component) without appearing
   *  in the component's own props type. TypeScript strips these before passing
   *  props to the component function / constructor. */
  export interface IntrinsicAttributes {
    key?: string | number | null;
  }
}
