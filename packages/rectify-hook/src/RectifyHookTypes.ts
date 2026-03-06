export enum HookType {
  STATE,
  EFFECT,
}

export type Hook<S = any> = StateHook<S> | EffectHook;

export type StateHook<S = any> = {
  type: HookType.STATE;
  state: S | undefined;
  queue: Array<StateUpdater<S | undefined>>;
};

export type StateUpdater<S> = S | ((prevState: S) => S);

export type StateDispatcher<S> = (state: StateUpdater<S>) => void;

export type EffectHook = {
  type: HookType.EFFECT;
  deps: any[] | undefined;
  create: () => void | (() => void);
  cleanup?: () => void;
};
