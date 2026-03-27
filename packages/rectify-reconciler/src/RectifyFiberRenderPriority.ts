import { DefaultLane, Lane, Lanes, SyncLane } from "./RectifyFiberLanes";

// ---------------------------------------------------------------------------
// Event priority – updated by the DOM event dispatcher
// ---------------------------------------------------------------------------

let currentEventPriority: Lane = DefaultLane;

export const setCurrentEventPriority = (lane: Lane): void => {
  currentEventPriority = lane;
};

export const resetCurrentEventPriority = (): void => {
  currentEventPriority = DefaultLane;
};

/**
 * Returns the lane that should be assigned to the current state update.
 * Inside a user event handler this will be InputLane; in async callbacks
 * (fetch, timers) it falls back to DefaultLane.
 */
export const requestUpdateLane = (): Lane => currentEventPriority;

// ---------------------------------------------------------------------------
// Rendering lanes – set by the scheduler before each render pass
// ---------------------------------------------------------------------------

let currentRenderingLanes: Lanes = SyncLane;

export const setCurrentRenderingLanes = (lanes: Lanes): void => {
  currentRenderingLanes = lanes;
};

export const getCurrentLanePriority = (): Lanes => currentRenderingLanes;
