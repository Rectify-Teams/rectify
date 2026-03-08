import { RectifyDomEventName } from "./RectifyEventName";

export const allNativeEvents: Set<RectifyDomEventName> = new Set();

export const registrationNameDependencies: {
  [registrationName: string]: Array<RectifyDomEventName>;
} = {};

export const nativeEventToRectifyName: Map<RectifyDomEventName, string> =
  new Map();

export function registerDirectEvent(
  registrationName: string,
  dependencies: Array<RectifyDomEventName>,
) {
  registrationNameDependencies[registrationName] = dependencies;

  for (let i = 0; i < dependencies.length; i++) {
    const dependency = dependencies[i];

    allNativeEvents.add(dependency);

    if (!nativeEventToRectifyName.has(dependency)) {
      nativeEventToRectifyName.set(dependency, registrationName);
    }
  }
}

export function registerNativeEvent() {
  // Mouse
  registerDirectEvent("onClick", ["click"]);
  registerDirectEvent("onDoubleClick", ["dblclick"]);
  registerDirectEvent("onMouseDown", ["mousedown"]);
  registerDirectEvent("onMouseUp", ["mouseup"]);
  registerDirectEvent("onMouseMove", ["mousemove"]);
  registerDirectEvent("onMouseEnter", ["mouseenter"]);
  registerDirectEvent("onMouseLeave", ["mouseleave"]);
  registerDirectEvent("onContextMenu", ["contextmenu"]);

  // Keyboard
  registerDirectEvent("onKeyDown", ["keydown"]);
  registerDirectEvent("onKeyUp", ["keyup"]);
  registerDirectEvent("onKeyPress", ["keypress"]);

  // Input / Form
  registerDirectEvent("onInput", ["input"]);
  registerDirectEvent("onChange", ["change"]);
  registerDirectEvent("onSubmit", ["submit"]);
  registerDirectEvent("onReset", ["reset"]);

  // Focus
  registerDirectEvent("onFocus", ["focus"]);
  registerDirectEvent("onBlur", ["blur"]);

  // Clipboard
  registerDirectEvent("onCopy", ["copy"]);
  registerDirectEvent("onCut", ["cut"]);
  registerDirectEvent("onPaste", ["paste"]);

  // Touch
  registerDirectEvent("onTouchStart", ["touchstart"]);
  registerDirectEvent("onTouchMove", ["touchmove"]);
  registerDirectEvent("onTouchEnd", ["touchend"]);
  registerDirectEvent("onTouchCancel", ["touchcancel"]);

  // Scroll / Wheel
  registerDirectEvent("onScroll", ["scroll"]);
  registerDirectEvent("onWheel", ["wheel"]);

  // Drag
  registerDirectEvent("onDrag", ["drag"]);
  registerDirectEvent("onDragStart", ["dragstart"]);
  registerDirectEvent("onDragEnd", ["dragend"]);
  registerDirectEvent("onDragEnter", ["dragenter"]);
  registerDirectEvent("onDragLeave", ["dragleave"]);
  registerDirectEvent("onDragOver", ["dragover"]);
  registerDirectEvent("onDrop", ["drop"]);
}
