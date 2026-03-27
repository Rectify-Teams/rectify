import {
  Fiber,
  isFunction,
  isPlainObject,
  isTextNode,
  omit,
  RECTIFY_ELEMENT_TYPE,
  RECTIFY_FRAGMENT_TYPE,
  RECTIFY_TEXT_TYPE,
  RectifyElement,
  shallowEqual,
} from "@rectify-dev/shared";
import {
  FragmentComponent,
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
  ContextProvider,
  MemoComponent,
} from "./RectifyFiberWorkTags";

const addFlagToFiber = (fiber: Fiber, flag: number): void => {
  if (hasFlagOnFiber(fiber, flag)) return;
  fiber.flags |= flag;
};

const removeFlagFromFiber = (fiber: Fiber | null, flag: number): void => {
  if (!hasFlagOnFiber(fiber, flag)) return;
  fiber!.flags &= ~flag;
};

const hasFlagOnFiber = (fiber: Fiber | null, flag: number): boolean => {
  if (!fiber) return false;
  return (fiber.flags & flag) !== 0;
};

const getFiberTagFromElement = (element: RectifyElement) => {
  switch (element.$$typeof) {
    case RECTIFY_ELEMENT_TYPE:
      if (isFunction(element.type) && (element.type as any)?._context === element.type) {
        return ContextProvider;
      }
      if (isFunction(element.type) && (element.type as any)?._isMemo === true) {
        return MemoComponent;
      }
      return isFunction(element.type) ? FunctionComponent : HostComponent;
    case RECTIFY_TEXT_TYPE:
      return HostText;
    case RECTIFY_FRAGMENT_TYPE:
      return FragmentComponent;
    default:
      return null;
  }
};

const createDomElementFromFiber = (fiber: Fiber): Node => {
  switch (fiber.workTag) {
    case HostText:
      return document.createTextNode(fiber.pendingProps);
    default:
      return document.createElement(fiber.type as string);
  }
};

const getParentDom = (fiber: Fiber): Node => {
  if (fiber.workTag === HostRoot)
    return fiber.stateNode as Node;

  let p = fiber.return;
  while (p) {
    if (p.workTag === HostComponent) return p.stateNode as Node;
    if (p.workTag === HostRoot) return p.stateNode as Node;
    p = p.return;
  }

  throw new Error("No parent DOM found.");
};

/**
 * Returns the first host DOM node (HostComponent or HostText) found by a
 * depth-first pre-order walk of the subtree rooted at `fiber`.
 * Returns null if the subtree contains no host nodes.
 */
function findFirstHostNode(fiber: Fiber): Node | null {
  if (fiber.workTag === HostComponent || fiber.workTag === HostText) {
    return fiber.stateNode as Node;
  }

  let child = fiber.child;
  while (child) {
    const found = findFirstHostNode(child);
    if (found) return found;
    child = child.sibling;
  }

  return null;
}

/**
 * Finds the nearest host DOM node that this fiber should be inserted before.
 * Walks the fiber's siblings; for each sibling performs a full depth-first
 * search so arbitrarily nested FunctionComponent / FragmentComponent wrappers
 * are transparent.
 */
function getHostSibling(fiber: Fiber): Node | null {
  let sibling = fiber.sibling;
  while (sibling) {
    const node = findFirstHostNode(sibling);
    if (node) return node;
    sibling = sibling.sibling;
  }

  return null;
}

const hasPropsChanged = (prevProps: any, nextProps: any) => {
  const CHILDREN_KEY = "children";
  const REF_KEY = "ref";
  if (isPlainObject(prevProps) && isPlainObject(nextProps)) {
    return !shallowEqual(
      omit(prevProps, [CHILDREN_KEY, REF_KEY]),
      omit(nextProps, [CHILDREN_KEY, REF_KEY]),
    );
  }

  return prevProps !== nextProps;
};

export {
  addFlagToFiber,
  removeFlagFromFiber,
  hasFlagOnFiber,
  getFiberTagFromElement,
  createDomElementFromFiber,
  getParentDom,
  getHostSibling,
  hasPropsChanged,
};
