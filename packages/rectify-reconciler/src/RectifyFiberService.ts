import {
  isFunction,
  RECTIFY_ELEMENT_TYPE,
  RECTIFY_FRAGMENT_TYPE,
  RECTIFY_TEXT_TYPE,
  RectifyElement,
} from "@rectify/shared";
import { Fiber } from "./RectifyFiberTypes";
import {
  FragmentComponent,
  FunctionComponent,
  HostComponent,
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

export {
  addFlagToFiber,
  removeFlagFromFiber,
  hasFlagOnFiber,
  getFiberTagFromElement,
};
