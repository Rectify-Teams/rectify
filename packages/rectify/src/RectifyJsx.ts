import { RECTIFY_ELEMENT_TYPE } from "./RectifyConstants";
import { RectifyElement, RectifyJsx, RectifyNode } from "./RectifyTypes";

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

const App = (props: { a: number; children: RectifyNode }) => {
  return jsx("div", props);
};

const P = () => jsx(App, { a: 1, children: [jsx("h1")] });
