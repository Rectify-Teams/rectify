import { FiberRoot } from "./RectifyFiberTypes";

type Instance = {
  fiberRoot: FiberRoot | null;
  isSchedulingRenderer: boolean;
};

const instance: Instance = {
  fiberRoot: null,
  isSchedulingRenderer: false,
};

(window as any)["__rectify"] = instance;

export const setScheduledFiberRoot = (fiberRoot: FiberRoot | null) => {
  instance.fiberRoot = fiberRoot;
};
export const getScheduledFiberRoot = () => {
  return instance.fiberRoot;
};

export const setSchedulingRenderer = (isRendering: boolean) => {
  instance.isSchedulingRenderer = isRendering;
};
export const getSchedulingRenderer = () => {
  return instance.isSchedulingRenderer;
};
