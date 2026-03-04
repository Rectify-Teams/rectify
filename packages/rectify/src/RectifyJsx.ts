import { RECTIFY_ELEMENT_TYPE } from "./RectifyConstants";
import { RectifyElement, RectifyJsx } from "@rectify/shared";

const createElement = (type: any, props?: any): RectifyElement => {
  const key = props?.key;
  return {
    $$typeof: RECTIFY_ELEMENT_TYPE,
    type,
    props,
    key,
  };
};

export const jsx: RectifyJsx = createElement;
