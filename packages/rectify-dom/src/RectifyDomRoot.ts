import {
  listenToAllEventSupported,
  markContainerAsRoot,
  unmarkContainerAsRoot,
} from "@rectify/dom-binding";
import { createContainer, updateContainer } from "@rectify/reconciler";
import { RectifyNode } from "@rectify/shared";

type RectifyDomRoot = {
  render: (node: RectifyNode) => void;
  unmount: () => void;
};

export const createRoot = (container: Element): RectifyDomRoot => {
  const hostRoot = createContainer(container);
  markContainerAsRoot(hostRoot.root, container);
  listenToAllEventSupported(container);
  return {
    render: (node: RectifyNode) => {
      updateContainer(node, hostRoot);
    },
    unmount: () => {
      unmarkContainerAsRoot(container);
    },
  };
};
