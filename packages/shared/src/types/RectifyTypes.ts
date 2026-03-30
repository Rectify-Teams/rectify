/**
 * Text node
 */
export type RectifyText = string | number;
export type RectifyIgnorable = boolean | null | undefined | void;

// Forward-declared so LazyComponent and RectifyFunctionalComponent can
// reference it before RectifyNode's full definition is written below.
export interface RectifyNodeBrand {
  __rectifyNode: never;
}

// ---------------------------------------------------------------------------
// Lazy  (declared before RectifyTypeJsx so the union can include it)
// ---------------------------------------------------------------------------

export type LazyStatus = "uninitialized" | "pending" | "resolved" | "rejected";

/**
 * A lazily-loaded component created by `lazy()`.
 * The call signature makes TypeScript accept it as a valid JSX element type.
 * Props are typed as `any` here; the actual props come from the wrapped FC.
 */
export type LazyComponent<T = any> = {
  (...args: any[]): any;
  _isLazy: true;
  _status: LazyStatus;
  _result: T | Error | null;
  _promise: Promise<void> | null;
  _factory: () => Promise<{ default: T } | T>;
};

// ---------------------------------------------------------------------------
// Core JSX types
// ---------------------------------------------------------------------------

export type RectifyFunctionalComponent<P = any> = (props: P) => RectifyNode;

export type RectifyTypeJsx<P = any> =
  | string
  | symbol
  | RectifyFunctionalComponent<P>
  | LazyComponent<any>
  | null;

export type RectifyNode =
  | RectifyText
  | RectifyIgnorable
  | RectifyElement
  | Iterable<RectifyNode>;

export type RectifyElement<P = any> = {
  $$typeof: symbol;
  type: RectifyTypeJsx<P>;
  props: P;
  key: RectifyKey;
};

export type RectifyKey = string | number | null | undefined;

type HasRequiredKeys<T extends object> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T] extends never
  ? false
  : true;

type PropsArg<P> =
  // no props at all
  [P] extends [never]
    ? [P?]
    : // object props: optional only if no required keys
      P extends object
      ? HasRequiredKeys<P> extends true
        ? [P]
        : [P?]
      : // non-object props: keep required
        [P];

export type RectifyJsx = <P = any>(
  type: RectifyTypeJsx<P>,
  ...props: PropsArg<P>
) => RectifyNode;

export type FC<P = any> = RectifyFunctionalComponent<P>;
