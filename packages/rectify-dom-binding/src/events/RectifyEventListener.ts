export function addEventBubbleListener(
  target: EventTarget,
  eventType: string,
  listener: EventListenerOrEventListenerObject | null,
): EventListenerOrEventListenerObject | null {
  target.addEventListener(eventType, listener, false);
  return listener;
}

export function addEventCaptureListener(
  target: EventTarget,
  eventType: string,
  listener: EventListenerOrEventListenerObject | null,
): EventListenerOrEventListenerObject | null {
  target.addEventListener(eventType, listener, true);
  return listener;
}

export function addEventCaptureListenerWithPassiveFlag(
  target: EventTarget,
  eventType: string,
  listener: EventListenerOrEventListenerObject | null,
  passive: boolean,
): EventListenerOrEventListenerObject | null {
  target.addEventListener(eventType, listener, {
    capture: true,
    passive,
  });
  return listener;
}

export function addEventBubbleListenerWithPassiveFlag(
  target: EventTarget,
  eventType: string,
  listener: EventListenerOrEventListenerObject | null,
  passive: boolean,
): EventListenerOrEventListenerObject | null {
  target.addEventListener(eventType, listener, {
    passive,
  });
  return listener;
}

export function removeEventListener(
  target: EventTarget,
  eventType: string,
  listener: EventListenerOrEventListenerObject | null,
  capture: boolean,
): void {
  target.removeEventListener(eventType, listener, capture);
}
