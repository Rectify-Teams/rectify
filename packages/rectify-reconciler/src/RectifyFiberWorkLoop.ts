import {
  createElementFromRectifyNode,
  Fiber,
  isFunction,
  isValidRectifyElement,
  RectifyNode,
  toArray,
} from "@rectify/shared";
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
} from "./RectifyFiberWorkTags";
import { withHooks } from "@rectify/hook";
import { addFlagToFiber, hasPropsChanged } from "./RectifyFiberService";
import {
  DeletionFlag,
  NoFlags,
  PlacementFlag,
  UpdateFlag,
} from "./RectifyFiberFlags";
import { Lanes, NoLanes } from "./RectifyFiberLanes";
import {
  createFiberFromRectifyElement,
  createWorkInProgress,
} from "./RectifyFiber";
import { getCurrentLanePriority } from "./RectifyFiberRenderPriority";

const replaceCurrentWithWip = (current: Fiber, wip: Fiber) => {
  const parent = wip.return;
  if (!parent) return;

  if (parent.child === current) {
    parent.child = wip;
  } else {
    let prevSibling = parent.child;
    while (prevSibling && prevSibling.sibling !== current) {
      prevSibling = prevSibling.sibling;
    }
    if (prevSibling) prevSibling.sibling = wip;
  }
};

export const workLoop = (wipRoot: Fiber) => {
  let workInProgress: Fiber | null = wipRoot;

  while (workInProgress) {
    const next = beginWork(workInProgress);

    if (next) {
      workInProgress = next;
    } else {
      workInProgress = completeUnitOfWork(workInProgress, wipRoot);
    }
  }
};

export const workLoopOnFiberLanes = (wipRoot: Fiber, renderLanes: Lanes) => {
  if (wipRoot.lanes & renderLanes) {
    const wip = createWorkInProgress(wipRoot, wipRoot.pendingProps);
    replaceCurrentWithWip(wipRoot, wip);
    workLoop(wip);
    bubbleFlagsToRoot(wip);
    return;
  }

  if (wipRoot.childLanes & renderLanes) {
    let child: Fiber | null = wipRoot.child;
    while (child) {
      workLoopOnFiberLanes(child, renderLanes);
      child = child.sibling;
    }
  }
};

const beginWork = (wip: Fiber): Fiber | null => {
  const workTag = wip.workTag;
  switch (workTag) {
    case FunctionComponent: {
      const Component = wip.type;
      if (!isFunction(Component)) break;
      const ComponentWithHooks = withHooks(wip, Component);
      const nextChildren = ComponentWithHooks(wip.pendingProps);
      reconcilerChildren(wip, nextChildren);
      break;
    }
    case HostRoot:
    case HostComponent: {
      const nextChildren = wip.pendingProps?.children;
      reconcilerChildren(wip, nextChildren);
      break;
    }
  }

  return wip.child;
};

const completeUnitOfWork = (unit: Fiber, stopAt: Fiber): Fiber | null => {
  let completed: Fiber | null = unit;

  while (completed) {
    bubbleProperties(completed);

    if (completed === stopAt) {
      return null;
    }

    if (completed.sibling) {
      return completed.sibling;
    }

    completed = completed.return;
  }

  return null;
};

const bubbleFlagsToRoot = (wip: Fiber) => {
  let current: Fiber = wip;
  let parent = current.return;
  while (parent) {
    parent.subtreeFlags |= current.flags | current.subtreeFlags;
    parent.childLanes |= current.lanes | current.childLanes;
    current = parent;
    parent = parent.return;
  }
};

const bubbleProperties = (wip: Fiber) => {
  wip.lanes &= ~getCurrentLanePriority();
  let subtreeFlags = NoFlags;
  let childLanes = NoLanes;

  let child = wip.child;
  while (child) {
    subtreeFlags |= child.flags;
    subtreeFlags |= child.subtreeFlags;

    childLanes |= child.lanes;
    childLanes |= child.childLanes;

    child.return = wip;
    child = child.sibling;
  }

  wip.subtreeFlags = subtreeFlags;
  wip.childLanes = childLanes;
};

const reconcilerChildren = (wip: Fiber, children: RectifyNode) => {
  const currentFiber = wip.alternate;
  const currentFiberChildHead = currentFiber?.child;
  const deletionFiber: Fiber[] = [];

  let index = 0;
  let oldCurrentFiberChild = currentFiberChildHead;
  let prevSibling: Fiber | null = null;

  toArray(children).forEach((child) => {
    const childElement = createElementFromRectifyNode(child);
    if (!isValidRectifyElement(childElement)) return;

    const childKey = childElement.key ?? null;
    const childType = childElement.type;

    let newFiber: Fiber;

    const isMatched =
      oldCurrentFiberChild &&
      oldCurrentFiberChild.key === childKey &&
      oldCurrentFiberChild.type === childType;

    if (isMatched) {
      newFiber = createWorkInProgress(
        oldCurrentFiberChild!,
        childElement.props,
      );
      const isPropsChanged = hasPropsChanged(
        oldCurrentFiberChild?.memoizedProps,
        childElement.props,
      );
      if (isPropsChanged) {
        addFlagToFiber(newFiber, UpdateFlag);
      }
    } else {
      newFiber = createFiberFromRectifyElement(childElement);
      addFlagToFiber(newFiber, PlacementFlag);

      if (oldCurrentFiberChild) {
        addFlagToFiber(oldCurrentFiberChild, DeletionFlag);
        deletionFiber.push(oldCurrentFiberChild);
      }
    }

    newFiber.return = wip;
    newFiber.index = index++;
    newFiber.key = childKey;
    newFiber.type = childType;

    if (!prevSibling) wip.child = newFiber;
    else prevSibling.sibling = newFiber;

    prevSibling = newFiber;
    oldCurrentFiberChild = oldCurrentFiberChild?.sibling;
  });

  while (oldCurrentFiberChild) {
    addFlagToFiber(oldCurrentFiberChild, DeletionFlag);
    deletionFiber.push(oldCurrentFiberChild);
    oldCurrentFiberChild = oldCurrentFiberChild.sibling;
  }

  if (deletionFiber.length) {
    wip.deletions = deletionFiber;
  }
};
