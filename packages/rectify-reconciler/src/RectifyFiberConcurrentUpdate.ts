import { Fiber } from "@rectify/shared";
import { Lanes } from "./RectifyFiberLanes";

type Update = {
  lanes: Lanes;
  fiber: Fiber;
  payload?: unknown;
  callback?: () => void;
  next: Update | null;
};

type Instance = {
  head: Update | null;
  tail: Update | null;
};

const instance: Instance = {
  head: null,
  tail: null,
};

const enqueueUpdate = (update: Update): void => {
  update.next = null;

  if (instance.tail === null) {
    instance.head = update;
    instance.tail = update;
    return;
  }

  instance.tail.next = update;
  instance.tail = update;

  console.log(instance);
};

const dequeueUpdate = (): Update | null => {
  const first = instance.head;
  if (first === null) {
    return null;
  }

  instance.head = first.next;

  if (instance.head === null) {
    instance.tail = null;
  }

  first.next = null;
  return first;
};

export { enqueueUpdate, dequeueUpdate };
