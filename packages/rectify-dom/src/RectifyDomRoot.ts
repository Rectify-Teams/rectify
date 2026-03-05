import { createContainer, updateContainer } from "@rectify/reconciler";
import { RectifyNode } from "@rectify/shared";

type RectifyDomRoot = {
  render: (node: RectifyNode) => void;
};

export const createRoot = (container: Element): RectifyDomRoot => {
  const hostRoot = createContainer(container);
  return {
    render: (node: RectifyNode) => {
      updateContainer(node, hostRoot);
    },
  };
};
