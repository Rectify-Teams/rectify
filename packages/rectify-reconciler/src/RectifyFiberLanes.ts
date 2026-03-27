export type Lanes = number;
export type Lane = number;

export const NoLanes         /*  */ = 0b00000;
export const SyncLane        /*  */ = 0b00001; // Immediate / initial render
export const InputLane       /*  */ = 0b00010; // User interactions (click, keyboard …)
export const DefaultLane     /*  */ = 0b00100; // Async / normal state updates
export const TransitionLane  /*  */ = 0b01000; // Deferred (startTransition)
export const IdleLane        /*  */ = 0b10000; // Background / idle work
