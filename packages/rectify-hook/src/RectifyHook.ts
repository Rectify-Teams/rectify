import { FC, Fiber } from "@rectify/shared";

const prepareToUseHooks = (wip: Fiber) => {};

const finishUsingHooks = () => {};

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
