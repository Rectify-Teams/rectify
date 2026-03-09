import { AnyNativeEvent } from "./RectifyDomEventListener";

class SyntheticEvent {
  target: Element | null;
  currentTarget: Element | null = null;
  nativeEvent: AnyNativeEvent;

  private propagationStopped: boolean = false;

  constructor(nativeEvent: AnyNativeEvent) {
    this.target = nativeEvent.target as Element;
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
