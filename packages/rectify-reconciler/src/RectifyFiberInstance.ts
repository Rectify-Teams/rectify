import { FiberRoot } from "./RectifyFiberTypes";

type Instance = {
  fiberRoot: FiberRoot | null;
};

const instance: Instance = {
  fiberRoot: null,
};

(window as any)["__rectify"] = instance;

export const setScheduledFiberRoot = (fiberRoot: FiberRoot | null) => {
  instance.fiberRoot = fiberRoot;
};

export const getScheduledFiberRoot = () => {
  return instance.fiberRoot;
};
