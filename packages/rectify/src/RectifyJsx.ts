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

const Content = ({}: { count?: number }) => {
  return jsx("div");
};

const App = () => {
  return jsx("div", {
    children: jsx(Content, { count: 1 }),
  });
};
