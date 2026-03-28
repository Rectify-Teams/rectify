import { Hook, isFunction } from "@rectify-dev/shared";
import { StateDispatcher, StateUpdater } from "./RectifyHookTypes";
import {
  getFiberRendering,
  getHookIndex,
  nextHookIndex,
  getHookSlot,
  attachHook,
  scheduleRerender,
} from "./RectifyHookRenderingFiber";

type StateInitializer<S> = S | (() => S);

const getInitialState = <S>(initialState: S | (() => S)): S =>
  isFunction(initialState) ? initialState() : initialState;

const getState = <S>(update: StateUpdater<S>, prevState: S) =>
  isFunction(update) ? update(prevState) : update;

function useState<S>(): [S | undefined, StateDispatcher<S | undefined>];
function useState<S>(initialState: S): [S, StateDispatcher<S>];
function useState<S>(initialState: () => S): [S, StateDispatcher<S>];
function useState<S>(
  initialState?: StateInitializer<S>,
): [S | undefined, StateDispatcher<S | undefined>] {
  const fiber = getFiberRendering();
  if (!fiber) {
    throw new Error("useState must be used within a function component.");
  }
  const hookIndex = getHookIndex();
  nextHookIndex();

  let { hook: state, prevHook } = getHookSlot(fiber, hookIndex) as {
    hook: Hook<S | undefined> | null;
    prevHook: Hook<S | undefined> | null;
  };

  if (!state) {
    state = {
      memoizedState: getInitialState(initialState),
      queue: null,
      next: null,
    };
    attachHook(fiber, state, prevHook);
  }

  let update = state.queue;
  while (update) {
    state.memoizedState = getState(update.action, state.memoizedState);
    update = update.next;
  }
  state.queue = null;

  const dispatcher = (updater: StateUpdater<S | undefined>) => {
    const update = { action: updater, next: null };

    if (!state.queue) {
      state.queue = update;
    } else {
      let last = state.queue;
      while (last.next) {
        last = last.next;
      }
      last.next = update;
    }
    scheduleRerender(fiber);
  };

  return [state.memoizedState, dispatcher] as const;
}

export default useState;
