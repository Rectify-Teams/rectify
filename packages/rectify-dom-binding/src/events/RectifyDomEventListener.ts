import { RectifyDomEventName } from "./RectifyEventName";

export type AnyNativeEvent = Event | KeyboardEvent | MouseEvent | TouchEvent;

export const createEventListenerWrapper = (
  targetContainer: EventTarget,
  domEventName: RectifyDomEventName,
) => {
  return dispatchEvent;
};

const dispatchEvent = (
  domEventName: RectifyDomEventName,
  targetContainer: EventTarget,
  nativeEvent: AnyNativeEvent,
) => {
  const targetContainerNode = targetContainer as Node;
};
