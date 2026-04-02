import { createEventListenerWrapper } from "./RectifyDomEventListener";
import { addEventBubbleListener, addEventCaptureListener } from "./RectifyEventListener";
import { RectifyDomEventName } from "./RectifyEventName";
import { allNativeEvents } from "./RectifyEventRegistry";

const listeningMarker =
  "_rectifyEventListening$" + Math.random().toString(36).slice(2);

export const isEventContainer = (dom: EventTarget): boolean =>
  !!(dom as any)[listeningMarker];

export const listenToAllEventSupported = (dom: EventTarget) => {
  if ((dom as any)[listeningMarker]) return;

  // If the container is already inside an existing Rectify event container,
  // skip registration entirely — the ancestor's capture listener already
  // covers all events originating from within this subtree.  Registering an
  // additional set of capture listeners on an inner node would cause every
  // event to be dispatched twice: once by the ancestor container and once by
  // this one.
  let ancestor = ((dom as Node | null)?.parentNode) ?? null;
  while (ancestor) {
    if ((ancestor as any)[listeningMarker]) return;
    ancestor = (ancestor as Node).parentNode;
  }

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
  addEventCaptureListener(target, domEventName, listener as any);
};
