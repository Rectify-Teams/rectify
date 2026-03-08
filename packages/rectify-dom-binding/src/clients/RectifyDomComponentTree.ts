import { RectifyDOMEventHandleListener } from "@rectify/events/RectifyDomEventTypes";
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
  if (!node) return;
  (node as any)[internalInstanceKey] = fiber;
};

export const getFiberNodeCached = (node: Node): Fiber | null => {
  if (!node) return null;
  return (node as any)[internalInstanceKey] || null;
};

export function setEventHandlerListeners(
  scope: EventTarget | null,
  listeners: Map<string, RectifyDOMEventHandleListener>,
): void {
  if (!scope) return;
  (scope as any)[internalEventHandlerListenersKey] = listeners;
}

export function getEventHandlerListeners(
  scope: EventTarget | null,
): null | Map<string, RectifyDOMEventHandleListener> {
  if (!scope) return null;
  return (scope as any)[internalEventHandlerListenersKey] || null;
}
