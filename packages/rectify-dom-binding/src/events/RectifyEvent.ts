import { createEventListenerWrapper } from "./RectifyDomEventListener";
import { addEventBubbleListener } from "./RectifyEventListener";
import { RectifyDomEventName } from "./RectifyEventName";
import { allNativeEvents } from "./RectifyEventRegistry";

const listeningMarker =
  "_rectifyEventListening$" + Math.random().toString(36).slice(2);

export const listenToAllEventSupported = (dom: EventTarget) => {
  if ((dom as any)[listeningMarker]) return;
  (dom as any)[listeningMarker] = true;

  allNativeEvents.forEach((domEventName) =>
    listenToNativeEvent(domEventName, dom),
  );
};

const listenToNativeEvent = (
  domEventName: RectifyDomEventName,
  target: EventTarget,
) => {
  const listener = createEventListenerWrapper(target, domEventName);
  addEventBubbleListener(target, domEventName, listener as any);
};
