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
} from "@rectify/shared";
import {
  FragmentComponent,
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
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

function getHostSibling(fiber: Fiber): Node | null {
  let sibling = fiber.sibling;
  while (sibling) {
    if (sibling.workTag === FunctionComponent) {
      let child = sibling.child;
      while (child) {
        if (child.workTag === HostComponent || child.workTag === HostText) {
          return child.stateNode;
        }
        child = child.sibling;
      }
    }
    if (sibling.workTag === HostComponent || sibling.workTag === HostText) {
      return sibling.stateNode;
    }
    sibling = sibling.sibling;
  }

  return null;
}

const hasPropsChanged = (prevProps: any, nextProps: any) => {
  const CHILDREN_KEY = "children";
  if (isPlainObject(prevProps) && isPlainObject(nextProps)) {
    return !shallowEqual(
      omit(prevProps, [CHILDREN_KEY]),
      omit(nextProps, [CHILDREN_KEY]),
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
