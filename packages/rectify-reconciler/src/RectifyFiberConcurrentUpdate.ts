import { Fiber } from "@rectify/shared";
import { Lanes } from "./RectifyFiberLanes";

type Update = {
  lanes: Lanes;
  fiber: Fiber;
  payload: any;
  callback?: () => void;
  next: Update | null;
};

type Instance = {
  updateQueue: Update | null;
};

const instance: Instance = {
  updateQueue: null,
};

let lastQueue: Update | null = null;
const enqueueUpdate = (update: Update) => {
  lastQueue = instance.updateQueue;
  while (lastQueue) {
    lastQueue = lastQueue.next;
  }
  instance.updateQueue = lastQueue = update;
};

const dequeueUpdate = () => {
  const update = instance.updateQueue;
  instance.updateQueue = instance.updateQueue?.next ?? null;
  return update;
};

export { enqueueUpdate, dequeueUpdate };
