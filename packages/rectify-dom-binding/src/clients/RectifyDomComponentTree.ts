import { Fiber } from "@rectify/shared";

const randomKey = Math.random().toString(36).slice(2);
const internalContainerInstanceKey = "__rectifyContainer$" + randomKey;
const internalInstanceKey = "__rectifyFiber$" + randomKey;

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
