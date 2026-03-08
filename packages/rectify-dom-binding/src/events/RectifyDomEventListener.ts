import { getEventHandlerListeners } from "../clients/RectifyDomComponentTree";
import { RectifyDomEventName } from "./RectifyEventName";

export type AnyNativeEvent = Event | KeyboardEvent | MouseEvent | TouchEvent;

export const createEventListenerWrapper = (
  targetContainer: EventTarget,
  domEventName: RectifyDomEventName,
) => {
  return dispatchEvent.bind(null, domEventName, targetContainer);
};

const dispatchEvent = (
  domEventName: RectifyDomEventName,
  targetContainer: EventTarget,
  nativeEvent: AnyNativeEvent,
) => {
  const currentTarget = (nativeEvent.target || nativeEvent.srcElement) as Node;
  const event = getEventHandlerListeners(currentTarget);

  if (!event) return;
  const handler = event.get(`on${domEventName}` as RectifyDomEventName);
  return handler?.call(null, nativeEvent);
};
