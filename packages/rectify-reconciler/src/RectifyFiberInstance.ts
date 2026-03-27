import { FiberRoot } from "./RectifyFiberTypes";

type Instance = {
  fiberRoot: FiberRoot | null;
};

const instance: Instance = {
  fiberRoot: null,
};

export const setScheduledFiberRoot = (fiberRoot: FiberRoot | null): void => {
  instance.fiberRoot = fiberRoot;
};

export const getScheduledFiberRoot = (): FiberRoot | null => {
  return instance.fiberRoot;
};
