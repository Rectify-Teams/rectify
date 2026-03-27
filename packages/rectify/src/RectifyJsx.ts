import {
  RECTIFY_ELEMENT_TYPE,
  RECTIFY_FRAGMENT_TYPE,
  RectifyElement,
  RectifyJsx,
} from "@rectify/shared";

const createElement = (type: any, props?: any): RectifyElement => {
  if (type === RECTIFY_FRAGMENT_TYPE) {
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

/** Symbol used as the `type` for JSX fragment syntax: `<>...</>` or `<Fragment>`. */
export const Fragment = RECTIFY_FRAGMENT_TYPE;
