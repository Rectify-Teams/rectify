import { Hook, isFunction } from "@rectify-dev/shared";
import {
  getFiberRendering,
  getHookIndex,
  nextHookIndex,
  getHookSlot,
  attachHook,
  scheduleRerender,
} from "./RectifyHookRenderingFiber";

export type Reducer<S, A> = (state: S, action: A) => S;
export type Dispatch<A> = (action: A) => void;

function useReducer<S, A>(reducer: Reducer<S, A>, initialState: S): [S, Dispatch<A>];
function useReducer<S, A, I>(
  reducer: Reducer<S, A>,
  initialArg: I,
  init: (arg: I) => S,
): [S, Dispatch<A>];
function useReducer<S, A, I>(
  reducer: Reducer<S, A>,
  initialArg: S | I,
  init?: (arg: I) => S,
): [S, Dispatch<A>] {
  const fiber = getFiberRendering();
  if (!fiber) {
    throw new Error("useReducer must be used within a function component.");
  }

  const hookIndex = getHookIndex();
  nextHookIndex();

  let { hook, prevHook } = getHookSlot(fiber, hookIndex) as {
    hook: Hook<S> | null;
    prevHook: Hook<S> | null;
  };

  if (!hook) {
    // Mount — compute initial state once.
    const initialState: S = isFunction(init)
      ? (init as (arg: I) => S)(initialArg as I)
      : (initialArg as S);

    hook = { memoizedState: initialState, queue: null, next: null };
    attachHook(fiber, hook, prevHook);
  }

  // Drain the update queue, applying each action through the reducer.
  let update = hook.queue;
  while (update) {
    hook.memoizedState = reducer(hook.memoizedState, update.action as A);
    update = update.next;
  }
  hook.queue = null;

  const dispatch: Dispatch<A> = (action: A) => {
    // UpdateQueue<S> stores `action` as `S | ((prev: S) => S)`, but for
    // useReducer the action is an arbitrary type A — cast to satisfy the
    // shared queue type while keeping the public API fully typed.
    const update = { action: action as any, next: null };

    if (!hook!.queue) {
      hook!.queue = update;
    } else {
      let last = hook!.queue;
      while (last.next) {
        last = last.next;
      }
      last.next = update;
    }
    scheduleRerender(fiber);
  };

  return [hook.memoizedState, dispatch];
}

export default useReducer;
