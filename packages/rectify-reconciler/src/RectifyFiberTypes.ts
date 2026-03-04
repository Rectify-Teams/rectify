export type Fiber = {
  child: Fiber | null;
  stateNode: Node | null;
};

export type FiberRoot = {
  root: Fiber;
  containerDom: Element;
};
