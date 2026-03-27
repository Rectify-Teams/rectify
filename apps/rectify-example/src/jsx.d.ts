/**
 * Global JSX type declarations for the rectify-example app.
 *
 * - IntrinsicElements: catch-all index signature so every HTML tag is valid.
 * - Element: the value type returned by every JSX expression.
 * - ElementChildrenAttribute: tells TypeScript which prop is "children".
 */
declare namespace JSX {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Element = any;

  interface IntrinsicElements {
    [elemName: string]: any;
  }

  interface ElementChildrenAttribute {
    children: {};
  }
}
