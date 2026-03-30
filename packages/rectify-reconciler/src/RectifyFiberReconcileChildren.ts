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
// Keyed map helpers
// ---------------------------------------------------------------------------

type OldFiberStructures = {
  /** Fibers that carry an explicit key — looked up by key. */
  keyedMap: Map<string | number, Fiber>;
  /**
   * Fibers with no explicit key — grouped by type and consumed in order.
   * Matching by type means a component that shifts position (e.g. because a
   * sibling is conditionally inserted before it) is still reused rather than
   * unmounted and remounted.
   */
  unkeyedByType: Map<unknown, Fiber[]>;
};

/**
 * Partition remaining old fibers into keyed (explicit key) and unkeyed
 * (matched by type in order of appearance) buckets.
 */
const buildOldFiberStructures = (
  firstRemaining: Fiber | null,
): OldFiberStructures => {
  const keyedMap = new Map<string | number, Fiber>();
  const unkeyedByType = new Map<unknown, Fiber[]>();
  let fiber: Fiber | null = firstRemaining;

  while (fiber) {
    if (fiber.key !== null && fiber.key !== undefined) {
      keyedMap.set(fiber.key, fiber);
    } else {
      const pool = unkeyedByType.get(fiber.type);
      if (pool) pool.push(fiber);
      else unkeyedByType.set(fiber.type, [fiber]);
    }
    fiber = fiber.sibling;
  }

  return { keyedMap, unkeyedByType };
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
    } else if (elementKey !== null) {
      // Same explicit key, different type — the old fiber is definitively
      // replaced; delete it and place the new one.
      addFlagToFiber(oldFiber, DeletionFlag);
      state.deletions.push(oldFiber);
      state.prev = appendFiber(
        createAndPlace(element, state.wip),
        state.prev,
        state.index++,
        state.wip,
      );
    } else {
      // Unkeyed type mismatch — stop and let reconcileKeyed match by type.
      // Do NOT delete the old fiber here; it may match a later new element.
      return { stoppedAt: i, oldFiber };
    }

    oldFiber = oldFiber.sibling;
  }

  return { stoppedAt: state.newElements.length, oldFiber };
};

/**
 * Keyed lookup — handles reordering, insertions, and removals.
 * Fibers with explicit keys are matched by key.
 * Fibers with no key are matched by type in order of appearance — this means
 * a component that shifts position because a sibling is conditionally inserted
 * before it is still reused rather than unmounted and remounted.
 */
const reconcileKeyed = (
  state: ReconcileState,
  startAt: number,
  remainingOldFiber: Fiber | null,
): void => {
  const { keyedMap, unkeyedByType } = buildOldFiberStructures(remainingOldFiber);

  // lastPlacedIndex tracks the highest committed index we have seen.
  // Any reused fiber whose committed index is below it was moved rightward.
  let lastPlacedIndex = 0;

  for (let i = startAt; i < state.newElements.length; i++) {
    const element = state.newElements[i];
    const { key: elementKey = null, type: elementType } = element;

    let matched: Fiber | null = null;

    if (elementKey !== null) {
      // Explicit key — look up by key.
      const candidate = keyedMap.get(elementKey) ?? null;
      if (candidate && candidate.type === elementType) {
        keyedMap.delete(elementKey);
        matched = candidate;
      }
    } else {
      // No key — take the first queued fiber of the same type (if any).
      const pool = unkeyedByType.get(elementType);
      if (pool?.length) matched = pool.shift()!;
    }

    if (matched) {
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

  // Delete all remaining unmatched fibers.
  for (const orphan of keyedMap.values()) {
    addFlagToFiber(orphan, DeletionFlag);
    state.deletions.push(orphan);
  }
  for (const pool of unkeyedByType.values()) {
    for (const orphan of pool) {
      addFlagToFiber(orphan, DeletionFlag);
      state.deletions.push(orphan);
    }
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
