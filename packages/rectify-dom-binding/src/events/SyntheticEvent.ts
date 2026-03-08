import { AnyNativeEvent } from "./RectifyDomEventListener";

class SyntheticEvent {
  target: EventTarget | null;
  currentTarget: Node | null = null;
  nativeEvent: AnyNativeEvent;

  private propagationStopped: boolean = false;

  constructor(nativeEvent: AnyNativeEvent) {
    this.target = nativeEvent.target;
    this.nativeEvent = nativeEvent;
  }

  stopPropagation() {
    this.propagationStopped = true;
    this.nativeEvent.stopPropagation();
  }

  isPropagationStopped() {
    return this.propagationStopped;
  }
}

export default SyntheticEvent;
