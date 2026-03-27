/**
 * Event priority injection point.
 *
 * @rectify-dev/dom-binding has no dependency on @rectify-dev/reconciler, so the
 * reconciler injects its priority functions here at startup via
 * `injectEventPriorityCallbacks`.  The event dispatcher then calls
 * `setEventPriority` / `resetEventPriority` around every handler invocation
 * so that state updates triggered by user events are assigned the correct lane.
 *
 * Lane values are plain numbers (not imported) to keep the dependency graph clean:
 *   InputLane  = 0b00010 = 2
 *   DefaultLane = 0b00100 = 4  (used as the reset value)
 */

type PriorityFn = (priority: number) => void;
type ResetFn = () => void;

let _set: PriorityFn = () => {};
let _reset: ResetFn = () => {};

/** Called once by the reconciler to wire up priority tracking. */
export const injectEventPriorityCallbacks = (
  set: PriorityFn,
  reset: ResetFn,
): void => {
  _set = set;
  _reset = reset;
};

/** Mark the start of a user-interaction event (sets InputLane). */
export const setEventPriority = (priority: number): void => _set(priority);

/** Restore default priority after an event handler returns. */
export const resetEventPriority = (): void => _reset();

/** Numeric constant – mirrors InputLane in @rectify-dev/reconciler. */
export const INPUT_LANE = 0b00010;
