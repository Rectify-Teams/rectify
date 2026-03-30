import {
  createElementFromRectifyNode,
  Fiber,
  isArray,
  isValidRectifyElement,
  RectifyElement,
  RectifyNode,
} from "@rectify-dev/shared";
import { addFlagToFiber, hasPropsChanged } from "./RectifyFiberService";
import {
  DeletionFlag,
  MoveFlag,
  PlacementFlag,
  RefFlag,
  UpdateFlag,
} from "./RectifyFiberFlags";
import {
  createFiberFromRectifyElement,
  createWorkInProgress,
} from "./RectifyFiber";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Mutable state threaded through the reconcileChildren pass functions. */
type ReconcileState = {
  wip: Fiber;
  newElements: RectifyElement[];
  deletions: Fiber[];
  prev: Fiber | null;
  index: number;
};

// ---------------------------------------------------------------------------
// Fiber creation helpers
// ---------------------------------------------------------------------------

/** Reuse an existing fiber, marking it for update if its props changed. */
const reuseOrCreate = (
  oldFiber: Fiber,
  element: RectifyElement,
  wip: Fiber,
): Fiber => {
  const newFiber = createWorkInProgress(oldFiber, element.props);

  if (hasPropsChanged(oldFiber.memoizedProps, element.props)) {
    addFlagToFiber(newFiber, UpdateFlag);
  }
  // Track ref changes independently so refs get attached/detached even when
  // no other props changed.
  if ((oldFiber.memoizedProps?.ref ?? null) !== (element.props?.ref ?? null)) {
    addFlagToFiber(newFiber, RefFlag);
  }

  newFiber.return = wip;
  return newFiber;
};

/** Create a brand-new fiber for `element` and mark it for DOM placement. */
const createAndPlace = (element: RectifyElement, wip: Fiber): Fiber => {
  const newFiber = createFiberFromRectifyElement(element);
  newFiber.type = element.type; // createFiberFromRectifyElement leaves type null
  addFlagToFiber(newFiber, PlacementFlag);
  newFiber.return = wip;
  return newFiber;
};

/**
 * Append `fiber` to the WIP child list at `index` and return it.
 * `prev` is the previously appended sibling (null for the first child).
 */
const appendFiber = (
  fiber: Fiber,
  prev: Fiber | null,
  index: number,
  wip: Fiber,
): Fiber => {
  fiber.index = index;
  if (!prev) wip.child = fiber;
  else prev.sibling = fiber;
  return fiber;
};

// ---------------------------------------------------------------------------
// Keyed map helper
// ---------------------------------------------------------------------------

/**
 * Build a key→fiber map from the remaining unconsumed old fibers so
 * reconcileKeyed can do O(1) lookups. Keys fall back to positional index when absent.
 */
const buildOldFiberMap = (
  firstRemaining: Fiber | null,
  startIndex: number,
): Map<string | number, Fiber> => {
  const map = new Map<string | number, Fiber>();
  let fiber: Fiber | null = firstRemaining;
  let i = startIndex;

  while (fiber) {
    map.set(fiber.key ?? i, fiber);
    fiber = fiber.sibling;
    i++;
  }

  return map;
};

// ---------------------------------------------------------------------------
// Reconcile passes
// ---------------------------------------------------------------------------

/**
 * Sequential scan — fast path, no reordering.
 * Walks both lists left-to-right by index as long as keys match consecutively.
 * Stops at the first key divergence and hands the remainder to reconcileKeyed.
 * Returns the index at which it stopped and the next unconsumed old fiber.
 */
const reconcileSequential = (
  state: ReconcileState,
  firstOldFiber: Fiber | null,
): { stoppedAt: number; oldFiber: Fiber | null } => {
  let oldFiber = firstOldFiber;

  for (let i = 0; i < state.newElements.length; i++) {
    const element = state.newElements[i];
    const { key: elementKey = null, type: elementType } = element;

    if (!oldFiber) return { stoppedAt: i, oldFiber: null }; // old list exhausted
    if (oldFiber.key !== elementKey) return { stoppedAt: i, oldFiber };  // keys diverged

    if (oldFiber.type === elementType) {
      state.prev = appendFiber(
        reuseOrCreate(oldFiber, element, state.wip),
        state.prev,
        state.index++,
        state.wip,
      );
    } else {
      // Same key, different type — delete old and place new.
      addFlagToFiber(oldFiber, DeletionFlag);
      state.deletions.push(oldFiber);
      state.prev = appendFiber(
        createAndPlace(element, state.wip),
        state.prev,
        state.index++,
        state.wip,
      );
    }

    oldFiber = oldFiber.sibling;
  }

  return { stoppedAt: state.newElements.length, oldFiber };
};

/**
 * Keyed lookup — handles reordering, insertions, and removals.
 * Builds a key→fiber map from the remaining old fibers and resolves each new
 * element by key (falling back to index). Only runs when reconcileSequential
 * stopped before consuming all new elements.
 */
const reconcileKeyed = (
  state: ReconcileState,
  startAt: number,
  remainingOldFiber: Fiber | null,
): void => {
  const oldFiberMap = buildOldFiberMap(remainingOldFiber, startAt);

  // lastPlacedIndex tracks the highest committed index we have seen.
  // Any reused fiber whose committed index is below it was moved rightward.
  let lastPlacedIndex = 0;

  for (let i = startAt; i < state.newElements.length; i++) {
    const element = state.newElements[i];
    const { key: elementKey = null, type: elementType } = element;
    const mapKey = elementKey ?? i;
    const matched = oldFiberMap.get(mapKey) ?? null;

    if (matched && matched.type === elementType) {
      oldFiberMap.delete(mapKey);
      const newFiber = reuseOrCreate(matched, element, state.wip);

      if (matched.index < lastPlacedIndex) {
        addFlagToFiber(newFiber, MoveFlag); // moved right — needs re-insertion
      } else {
        lastPlacedIndex = matched.index;
      }

      state.prev = appendFiber(newFiber, state.prev, state.index++, state.wip);
    } else {
      state.prev = appendFiber(
        createAndPlace(element, state.wip),
        state.prev,
        state.index++,
        state.wip,
      );
    }
  }

  // Fibers left in the map have no matching new element — delete them.
  for (const orphan of oldFiberMap.values()) {
    addFlagToFiber(orphan, DeletionFlag);
    state.deletions.push(orphan);
  }
};

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Normalise the raw `children` value into a flat array of `RectifyNode` items
 * ready to be mapped through `createElementFromRectifyNode`.
 */
const toChildArray = (children: RectifyNode): RectifyNode[] => {
  if (children == null || typeof children === "boolean") return [];
  if (isArray(children)) return children as RectifyNode[];
  return [children as RectifyNode];
};

export const reconcileChildren = (wip: Fiber, children: RectifyNode): void => {
  const newElements = toChildArray(children)
    .map(createElementFromRectifyNode)
    .filter(isValidRectifyElement);

  const state: ReconcileState = {
    wip,
    newElements,
    deletions: [],
    prev: null,
    index: 0,
  };
  const firstOldFiber: Fiber | null = wip.alternate?.child ?? null;

  const { stoppedAt, oldFiber } = reconcileSequential(state, firstOldFiber);

  if (stoppedAt < newElements.length) {
    // Sequential scan stopped early — resolve the remainder by key.
    reconcileKeyed(state, stoppedAt, oldFiber);
  } else {
    // Pass 1 consumed all new elements — delete any leftover old fibers.
    let leftover: Fiber | null = oldFiber;
    while (leftover) {
      addFlagToFiber(leftover, DeletionFlag);
      state.deletions.push(leftover);
      leftover = leftover.sibling;
    }
  }

  if (state.prev) state.prev.sibling = null; // terminate the new sibling chain
  if (state.deletions.length) wip.deletions = state.deletions;
};
