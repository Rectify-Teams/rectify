import { createContainer, updateContainer } from "@rectify/reconciler";
import { RectifyNode } from "@rectify/shared";

export const createRoot = (container: Element) => {
  const hostRoot = createContainer(container);
  return {
    render: (node: RectifyNode) => {
      updateContainer(node, hostRoot);
    },
  };
};
