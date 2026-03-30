import { Fiber } from "@rectify-dev/shared";
import { runEffectCleanups, clearContextSubscriptions } from "@rectify-dev/hook";
import { ClassComponent, HostComponent, HostText } from "./RectifyFiberWorkTags";
import { detachRef } from "./RectifyFiberCommitRef";

// ---------------------------------------------------------------------------
// removeHostTree
// ---------------------------------------------------------------------------

/**
 * Recursively unmount a fiber subtree:
 * 1. Call componentWillUnmount on class component instances.
 * 2. Run effect cleanups and unsubscribe from contexts.
 * 3. Detach refs and remove the DOM node for host fibers.
 * 4. Recurse into children.
 */
export const removeHostTree = (fiber: Fiber): void => {
  if (fiber.workTag === ClassComponent) {
    fiber.classInstance?.componentWillUnmount?.();
  }

  if (fiber.memoizedState) {
    runEffectCleanups(fiber);
  }
  clearContextSubscriptions(fiber);

  if (fiber.workTag === HostComponent || fiber.workTag === HostText) {
    detachRef(fiber);
    (fiber.stateNode as Element)?.remove();
  }

  let child = fiber.child;
  while (child) {
    removeHostTree(child);
    child = child.sibling;
  }
};
