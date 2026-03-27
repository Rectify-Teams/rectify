export type StateUpdater<S> = S | ((prevState: S) => S);

export type StateDispatcher<S> = (updater: StateUpdater<S>) => void;

/** Shared state shape stored in a hook slot for useEffect / useLayoutEffect. */
export type EffectState = {
  create: () => void | (() => void);
  deps: any[] | undefined;
  cleanup: (() => void) | undefined;
};
