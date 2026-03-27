import { Fiber } from "@rectify/shared";
import { Lanes } from "./RectifyFiberLanes";

export type UpdateQueue = {
  lanes: Lanes;
  fiber: Fiber;
  next: UpdateQueue | null;
};

type Instance = {
  head: UpdateQueue | null;
  tail: UpdateQueue | null;
};

const instance: Instance = {
  head: null,
  tail: null,
};

const enqueueUpdate = (update: UpdateQueue): void => {
  update.next = null;

  if (instance.tail === null) {
    instance.head = update;
    instance.tail = update;
    return;
  }

  instance.tail.next = update;
  instance.tail = update;
};

const dequeueUpdate = (): UpdateQueue | null => {
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
