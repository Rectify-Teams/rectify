/**
 * Text node
 */
export type RectifyText = string | number;

export type RectifyFunctionalComponent<P = any> = (props: P) => RectifyNode;

export type RectifyTypeJsx<P = any> =
  | string
  | symbol
  | RectifyFunctionalComponent<P>
  | null;

export type RectifyNode =
  | RectifyText
  | RectifyIgnorable
  | RectifyElement
  | Iterable<RectifyNode>;

export type RectifyIgnorable = boolean | null | undefined | void;

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
