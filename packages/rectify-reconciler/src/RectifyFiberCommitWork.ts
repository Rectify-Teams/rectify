import { Fiber } from "@rectify-dev/shared";
import { NoFlags, MoveFlag, PlacementFlag, RefFlag, UpdateFlag } from "./RectifyFiberFlags";
import { commitMutation } from "./RectifyFiberCommitMutation";
import { removeHostTree } from "./RectifyFiberCommitRemoval";
import { ClassComponent } from "./RectifyFiberWorkTags";

const MutationMask = PlacementFlag | UpdateFlag | MoveFlag | RefFlag;

// ---------------------------------------------------------------------------
// commitWork
// ---------------------------------------------------------------------------

export const commitWork = (finishedWork: Fiber): void => {
  // 1. Remove deleted fibers first so the DOM is clean before mutations.
  if (finishedWork.deletions?.length) {
    finishedWork.deletions.forEach(removeHostTree);
    finishedWork.deletions = null;
  }

  // 2. Apply mutations on this fiber, then sync memoizedProps.
  if (finishedWork.flags & MutationMask) {
    commitMutation(finishedWork);
    finishedWork.memoizedProps = finishedWork.pendingProps;
  }

  // 3. Recurse into children that have pending mutations.
  if (finishedWork.subtreeFlags & MutationMask) {
    let child = finishedWork.child;
    while (child) {
      commitWork(child);
      child = child.sibling;
    }
  }

  // 4. Fire class component lifecycle hooks after the subtree is committed.
  if (finishedWork.workTag === ClassComponent && finishedWork.classInstance) {
    const instance = finishedWork.classInstance;
    const isMount = finishedWork.alternate === null;
    if (isMount) {
      instance.componentDidMount?.();
    } else if (instance._prevState !== undefined) {
      // _prevState is only set when the component actually rendered in this
      // pass (beginWork ClassComponent update path). If the component bailed
      // out it won't be set, so we correctly skip componentDidUpdate.
      instance.componentDidUpdate?.(
        instance._prevProps,
        instance._prevState,
      );
      instance._prevProps = undefined;
      instance._prevState = undefined;
    }
  }

  // 5. Reset flags after this node is fully committed.
  finishedWork.flags = NoFlags;
  finishedWork.subtreeFlags = NoFlags;
};
