/**
 * Text node
 */
export type RectifyText = string | number;

export type RectifyFunctionalComponent<P = any> = (props: P) => RectifyNode<P>;

export type RectifyTypeJsx<P = any> =
  | string
  | RectifyFunctionalComponent<P>
  | null;

export type RectifyNode<P = any> =
  | RectifyText
  | RectifyIgnorable
  | RectifyElement<P>
  | Iterable<RectifyNode>;

export type RectifyIgnorable = boolean | null | undefined | void;

export type RectifyElement<P = any> = {
  $$typeof: symbol;
  type: RectifyTypeJsx<P>;
  props: P;
  key: RectifyKey;
};

export type RectifyKey = string | number | null | undefined;

export type RectifyJsx = <P = any>(
  type: RectifyTypeJsx<P>,
  props?: P,
) => RectifyNode;
