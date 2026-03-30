import type { RectifyNode } from "@rectify-dev/shared";
import { scheduleRerender } from "@rectify-dev/hook";

/**
 * Base class for Rectify class components.
 *
 * @example
 * class Counter extends Component<{}, { count: number }> {
 *   state = { count: 0 };
 *
 *   render() {
 *     return (
 *       <button onClick={() => this.setState({ count: this.state.count + 1 })}>
 *         {this.state.count}
 *       </button>
 *     );
 *   }
 * }
 */
export class Component<P = {}, S = {}> {
  /** Marks this as a class component for the reconciler. */
  static readonly _isClassComponent = true;

  props: P;
  state: S = {} as S;

  /**
   * @internal Set by the reconciler when the instance is created so
   * `setState` can enqueue a re-render on the correct fiber.
   */
  _fiber: import("@rectify-dev/shared").Fiber | null = null;

  /**
   * @internal Snapshots taken by the reconciler in beginWork before each
   * update render so that `componentDidUpdate` receives the correct prev values.
   * Cleared after `componentDidUpdate` is called.
   */
  _prevProps: P | undefined = undefined;
  _prevState: S | undefined = undefined;

  /**
   * @internal Queue of pending setState updates, flushed by the reconciler
   * during beginWork so that prevState snapshots can be taken first.
   */
  _pendingStateQueue: Array<
    Partial<S> | ((prevState: S, prevProps: P) => Partial<S>)
  > = [];

  constructor(props: P) {
    this.props = props;
  }

  // ---------------------------------------------------------------------------
  // Lifecycle hooks (optional overrides)
  // ---------------------------------------------------------------------------

  /** Called once, immediately after the component is inserted into the DOM. */
  componentDidMount?(): void;

  /**
   * Called after every re-render.
   * @param prevProps — props before the update
   * @param prevState — state before the update
   */
  componentDidUpdate?(prevProps: P, prevState: S): void;

  /** Called immediately before the component is removed from the DOM. */
  componentWillUnmount?(): void;

  /**
   * Return false to skip re-rendering when props or state haven't changed.
   * Defaults to always re-render.
   */
  shouldComponentUpdate?(nextProps: P, nextState: S): boolean;

  // ---------------------------------------------------------------------------
  // Core API
  // ---------------------------------------------------------------------------

  /**
   * Merges `partialState` into the current state and schedules a re-render.
   * Accepts either a plain partial state object or an updater function.
   */
  setState(
    partialState: Partial<S> | ((prevState: S, prevProps: P) => Partial<S>),
  ): void {
    // Enqueue rather than apply immediately so that beginWork can snapshot
    // prevState BEFORE flushing — giving componentDidUpdate the correct value.
    this._pendingStateQueue.push(partialState);

    if (this._fiber) {
      scheduleRerender(this._fiber);
    }
  }

  /**
   * Must be implemented by every class component.
   * Returns the subtree to render.
   */
  render(): RectifyNode {
    return null;
  }
}
