import {
  RECTIFY_ELEMENT_TYPE,
  RECTIFY_FRAGMENT_TYPE,
  RectifyElement,
  RectifyJsx,
} from "@rectify/shared";

/**
 * Sentinel function that represents a fragment in JSX.
 * Never actually called at runtime — `createElement` intercepts it by
 * identity so `<>` and `<Fragment>` both produce a RECTIFY_FRAGMENT_TYPE element.
 */
export const Fragment = (): null => null;

const createElement = (type: any, props?: any): RectifyElement => {
  if (type === Fragment) {
    return {
      $$typeof: RECTIFY_FRAGMENT_TYPE,
      type: null,
      props,
      key: props?.key ?? null,
    };
  }

  const key = props?.key;
  return {
    $$typeof: RECTIFY_ELEMENT_TYPE,
    type,
    props,
    key,
  };
};

export const jsx: RectifyJsx = createElement;
