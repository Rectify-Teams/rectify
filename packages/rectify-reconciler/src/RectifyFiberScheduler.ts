import { Fiber } from "@rectify/shared";
import {
  DefaultLane,
  IdleLane,
  InputLane,
  Lane,
  Lanes,
  NoLanes,
  SyncLane,
  TransitionLane,
} from "./RectifyFiberLanes";

// ---------------------------------------------------------------------------
// Frame budget / shouldYield
// ---------------------------------------------------------------------------

/** Max ms of render work to perform per scheduler task (foundation for time-slicing). */
const FRAME_BUDGET_MS = 5;

let frameStart = 0;

/**
 * Returns true when the current work slice has run longer than FRAME_BUDGET_MS.
 * Use this inside tight work loops to yield back to the browser.
 */
export const shouldYield = (): boolean =>
  performance.now() - frameStart > FRAME_BUDGET_MS;

// ---------------------------------------------------------------------------
// Work callback – injected by the reconciler
// ---------------------------------------------------------------------------

type WorkCallback = (lanes: Lanes) => void;

let doWork: WorkCallback | null = null;

/** Inject the render function that the scheduler calls when a task fires. */
export const setWorkCallback = (cb: WorkCallback): void => {
  doWork = cb;
};

// ---------------------------------------------------------------------------
// Resume cursor – the exact fiber workLoopConcurrent stopped at
// ---------------------------------------------------------------------------

/**
 * When workLoopConcurrent yields mid-tree this holds the exact fiber it
 * stopped at. The next task passes this back so work truly continues from
 * where it left off rather than restarting from the WIP root.
 */
let resumeCursor: Fiber | null = null;

export const setResumeCursor = (fiber: Fiber | null): void => {
  resumeCursor = fiber;
};

export const getResumeCursor = (): Fiber | null => resumeCursor;

export const clearResumeCursor = (): void => {
  resumeCursor = null;
};

// ---------------------------------------------------------------------------
// Pending lanes
// ---------------------------------------------------------------------------

/** Bitfield of lanes enqueued but not yet processed. */
let pendingLanes: Lanes = NoLanes;

/**
 * Enqueue a render for `lane` and ensure the appropriate scheduler task is
 * posted.  Multiple calls for the same lane before the task fires are
 * deduplicated – only one task is ever in flight per scheduling tier.
 */
export const scheduleRenderLane = (lane: Lane): void => {
  pendingLanes |= lane;

  if (lane & (SyncLane | InputLane)) {
    // Highest async priority: runs before the next paint via microtask queue.
    scheduleMicrotask();
  } else if (lane & DefaultLane) {
    // Normal async priority: MessageChannel macrotask, yields to browser.
    scheduleMessageTask();
  } else if (lane & TransitionLane) {
    // Deferred: setTimeout(0) – lower priority than regular tasks.
    scheduleTimeout();
  } else if (lane & IdleLane) {
    // Background: requestIdleCallback when the main thread is idle.
    scheduleIdle();
  }
};

// ---------------------------------------------------------------------------
// Internal flush helper
// ---------------------------------------------------------------------------

const flush = (mask: Lanes): void => {
  const lanes = pendingLanes & mask;
  if (!lanes) return;
  pendingLanes &= ~lanes;
  frameStart = performance.now();
  doWork?.(lanes);
};

// ---------------------------------------------------------------------------
// Microtask scheduler  (SyncLane | InputLane)
// ---------------------------------------------------------------------------

const MICROTASK_MASK = SyncLane | InputLane;
let microtaskScheduled = false;

const scheduleMicrotask = (): void => {
  if (microtaskScheduled) return;
  microtaskScheduled = true;
  queueMicrotask(() => {
    microtaskScheduled = false;
    flush(MICROTASK_MASK);
  });
};

// ---------------------------------------------------------------------------
// MessageChannel scheduler  (DefaultLane)
// ---------------------------------------------------------------------------

const DEFAULT_MASK = DefaultLane;
const mc = new MessageChannel();
let mcScheduled = false;

mc.port1.onmessage = () => {
  mcScheduled = false;
  flush(DEFAULT_MASK);
};

const scheduleMessageTask = (): void => {
  if (mcScheduled) return;
  mcScheduled = true;
  mc.port2.postMessage(null);
};

// ---------------------------------------------------------------------------
// setTimeout scheduler  (TransitionLane)
// ---------------------------------------------------------------------------

const TRANSITION_MASK = TransitionLane;
let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

const scheduleTimeout = (): void => {
  if (timeoutHandle !== null) return;
  timeoutHandle = setTimeout(() => {
    timeoutHandle = null;
    flush(TRANSITION_MASK);
  }, 0);
};

// ---------------------------------------------------------------------------
// requestIdleCallback scheduler  (IdleLane)
// ---------------------------------------------------------------------------

const IDLE_MASK = IdleLane;
let idleHandle: number | null = null;

const scheduleIdle = (): void => {
  if (idleHandle !== null) return;

  const run = () => {
    idleHandle = null;
    flush(IDLE_MASK);
  };

  if (typeof requestIdleCallback !== "undefined") {
    idleHandle = requestIdleCallback(run, { timeout: 300 }) as unknown as number;
  } else {
    idleHandle = setTimeout(run, 300) as unknown as number;
  }
};
