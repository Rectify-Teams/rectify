import { SyncLane } from "./RectifyFiberLanes";

const requestUpdateLane = () => {
  return SyncLane;
};

const getCurrentLanePriority = () => {
  return SyncLane;
};

export { requestUpdateLane, getCurrentLanePriority };
