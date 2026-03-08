import {
  RectifyDOMEventHandle,
  RectifyDOMEventHandleListener,
} from "@rectify/events/RectifyDomEventTypes";
import { RectifyDomEventName } from "@rectify/events/RectifyEventName";
import { Fiber } from "@rectify/shared";

const randomKey = Math.random().toString(36).slice(2);
const internalContainerInstanceKey = "__rectifyContainer$" + randomKey;
const internalInstanceKey = "__rectifyFiber$" + randomKey;
const internalEventHandlerListenersKey = "__rectifyListeners$" + randomKey;
const internalEventHandlesSetKey = "__rectifyHandles$" + randomKey;

export function markContainerAsRoot(
  hostRoot: Fiber,
  node: Element | Node,
): void {
  (node as any)[internalContainerInstanceKey] = hostRoot;
}

export function unmarkContainerAsRoot(node: Element | Node): void {
  (node as any)[internalContainerInstanceKey] = null;
}

export function isContainerMarkedAsRoot(node: Element | Node): boolean {
  return !!(node as any)[internalContainerInstanceKey];
}

export const precacheFiberNode = (fiber: Fiber, node: Node) => {
  (node as any)[internalInstanceKey] = fiber;
};

export function setEventHandlerListeners(
  scope: EventTarget,
  listeners: Map<RectifyDomEventName, RectifyDOMEventHandleListener>,
): void {
  (scope as any)[internalEventHandlerListenersKey] = listeners;
}

export function getEventHandlerListeners(
  scope: EventTarget,
): null | Map<RectifyDomEventName, RectifyDOMEventHandleListener> {
  return (scope as any)[internalEventHandlerListenersKey] || null;
}

export function addEventHandleToTarget(
  target: EventTarget,
  eventHandle: RectifyDOMEventHandle,
): void {
  let eventHandles = (target as any)[internalEventHandlesSetKey];
  if (!eventHandles) {
    eventHandles = (target as any)[internalEventHandlesSetKey] = new Set();
  }
  eventHandles.add(eventHandle);
}
