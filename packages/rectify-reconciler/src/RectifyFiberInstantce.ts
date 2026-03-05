import { FiberRoot } from "./RectifyFiberTypes";

type Instance = {
  fiberRoot: FiberRoot | null;
};

const instance: Instance = {
  fiberRoot: null,
};

export const setScheduledFiberRoot = (fiberRoot: FiberRoot | null) => {
  instance.fiberRoot = fiberRoot;
};

export const getScheduledFiberRoot = () => {
  return instance.fiberRoot;
};
