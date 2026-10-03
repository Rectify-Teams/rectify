import { FiberRoot } from "./RectifyFiberTypes";

/**
 * Every mounted root. A page can have several independent `createRoot()`
 * containers, and a state update can target any of them, so the scheduler has
 * to walk all of them rather than remember only the most recently rendered one.
 */
const fiberRoots = new Set<FiberRoot>();

export const registerFiberRoot = (fiberRoot: FiberRoot): void => {
  fiberRoot && fiberRoots.add(fiberRoot);
};

export const unregisterFiberRoot = (fiberRoot: FiberRoot): void => {
  fiberRoots.delete(fiberRoot);
};

/** Snapshot, so callers may register/unregister roots while iterating. */
export const getFiberRoots = (): FiberRoot[] => Array.from(fiberRoots);
