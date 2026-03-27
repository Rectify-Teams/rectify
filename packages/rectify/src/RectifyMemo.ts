import { FC } from "@rectify/shared";

export type MemoComponent<P = any> = FC<P> & {
  /** Marks this as a memo-wrapped component for the reconciler. */
  _isMemo: true;
  /** The wrapped component that will be called on actual renders. */
  _render: FC<P>;
  /** Custom comparator — defaults to shallow equality when absent. */
  _compare: ((prevProps: P, nextProps: P) => boolean) | null;
};

/**
 * Wraps a component with a custom props comparator.
 *
 * By default every component already bails out automatically when props are
 * shallowly equal. Use `memo` only when you need a **custom** comparison —
 * for example, deep equality on a specific prop, or ignoring certain keys.
 *
 * @example
 * // Ignore the `style` prop when deciding whether to re-render
 * const Chart = memo(
 *   ({ data }) => jsx('canvas', { ... }),
 *   (prev, next) => Object.is(prev.data, next.data),
 * );
 */
export function memo<P = any>(
  Component: FC<P>,
  compare?: (prevProps: P, nextProps: P) => boolean,
): MemoComponent<P> {
  const wrapper = ((_props: P) => null) as unknown as MemoComponent<P>;
  wrapper._isMemo = true;
  wrapper._render = Component;
  wrapper._compare = compare ?? null;
  return wrapper;
}
