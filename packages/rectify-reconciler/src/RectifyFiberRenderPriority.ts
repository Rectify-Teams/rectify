import { SyncLane } from "./RectifyFiberLanes";

const requestUpdateLane = () => {
  return SyncLane;
};

export { requestUpdateLane };
