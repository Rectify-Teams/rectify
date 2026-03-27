import { FC, Fiber } from "@rectify-dev/shared";
import { setFiberRendering, setHookIndex } from "./RectifyHookRenderingFiber";

const prepareToUseHooks = (wip: Fiber) => {
  setFiberRendering(wip);
  setHookIndex(0);
};

const finishUsingHooks = () => {
  setFiberRendering(null);
};

const withHooks = (wip: Fiber, Component: FC) => {
  const NewComponent = (props: any) => {
    prepareToUseHooks(wip);
    const result = Component(props);
    finishUsingHooks();
    return result;
  };

  return NewComponent;
};

export { withHooks };
