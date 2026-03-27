import { Fiber, isFunction } from "@rectify/shared";
import {
  getEventHandlerListeners,
  getFiberNodeCached,
} from "../clients/RectifyDomComponentTree";
import { RectifyDomEventName } from "./RectifyEventName";
import SyntheticEvent from "./SyntheticEvent";
import { nativeEventToRectifyName } from "./RectifyEventRegistry";
import {
  INPUT_LANE,
  setEventPriority,
  resetEventPriority,
} from "./RectifyEventPriority";

export type AnyNativeEvent = Event | KeyboardEvent | MouseEvent | TouchEvent;

export const createEventListenerWrapper = (
  targetContainer: EventTarget,
  domEventName: RectifyDomEventName,
) => {
  return dispatchEvent.bind(null, domEventName, targetContainer);
};

const getEventTarget = (nativeEvent: AnyNativeEvent) => {
  return (nativeEvent.target || nativeEvent.srcElement) as Node;
};

const dispatchEvent = (
  domEventName: RectifyDomEventName,
  targetContainer: EventTarget,
  nativeEvent: AnyNativeEvent,
) => {
  const targetNode = getEventTarget(nativeEvent);
  const targetFiber = getFiberNodeCached(targetNode);

  if (!targetFiber) return;

  const syntheticEvent = new SyntheticEvent(nativeEvent);

  const path: Fiber[] = [];
  let fiber: Fiber | null = targetFiber;

  while (fiber) {
    path.push(fiber);
    if (fiber.stateNode === targetContainer) {
      break;
    }
    fiber = fiber.return;
  }

  for (const currFiber of path) {
    if (syntheticEvent.isPropagationStopped()) break;

    const eventHandlerMap = getEventHandlerListeners(
      currFiber.stateNode as Node,
    );
    if (!eventHandlerMap) continue;
    const rectifyName = nativeEventToRectifyName.get(domEventName);
    if (!rectifyName) continue;
    const handler = eventHandlerMap.get(rectifyName);

    if (!isFunction(handler)) continue;

    syntheticEvent.currentTarget = currFiber.stateNode as Element;
    setEventPriority(INPUT_LANE);
    try {
      handler(syntheticEvent);
    } finally {
      resetEventPriority();
    }
  }

  syntheticEvent.currentTarget = null;
};
