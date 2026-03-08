import { AnyNativeEvent } from "./RectifyDomEventListener";

export type RectifyDOMEventHandle = (
  target: EventTarget,
  callback: (e: AnyNativeEvent) => void,
) => () => void;

export type RectifyDOMEventHandleListener = (e: AnyNativeEvent) => void;
