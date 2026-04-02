import { RECTIFY_PORTAL_TYPE } from "@rectify-dev/shared";
import type { RectifyKey, RectifyNode, RectifyPortal } from "@rectify-dev/shared";

export const createPortal = (
  children: RectifyNode,
  container: Element,
  key: RectifyKey = null,
): RectifyPortal => {
  return {
    $$typeof: RECTIFY_PORTAL_TYPE,
    type: null,
    key,
    props: {
      children,
      containerInfo: container,
    },
  };
};
