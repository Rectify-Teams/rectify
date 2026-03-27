import { RectifyDomEventName } from "./../events/RectifyEventName";
import { isPlainObject } from "@rectify-dev/shared";
import {
  getEventHandlerListeners,
  setEventHandlerListeners,
} from "./RectifyDomComponentTree";
import { RectifyDOMEventHandleListener } from "../events/RectifyDomEventTypes";

const isEvent = (k: string) => k.startsWith("on");
const isProperty = (k: string) =>
  k !== "children" && k !== "ref" && !isEvent(k);

const unitlessProperties = new Set([
  "zIndex",
  "opacity",
  "fontWeight",
  "lineHeight",
  "flex",
  "flexGrow",
  "flexShrink",
]);

function convertStyleObjectToString(styleObj: object) {
  return Object.entries(styleObj)
    .map(([key, value]) => {
      const cssKey = key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

      let cssValue = value;

      if (typeof value === "number" && !unitlessProperties.has(key)) {
        cssValue = `${value}px`;
      }

      return `${cssKey}:${cssValue}`;
    })
    .join("; ");
}

export const applyPropsToDom = (
  node: Node,
  prevProps: any = {},
  nextProps: any = {},
) => {
  const element = node as Element;

  const eventNode =
    getEventHandlerListeners(element) ||
    new Map<RectifyDomEventName, RectifyDOMEventHandleListener>();

  for (const k in prevProps) {
    if (isEvent(k) && !(k in nextProps)) {
      eventNode.delete(k as RectifyDomEventName);
    }
    if (isProperty(k) && !(k in nextProps)) {
      (element as any)[k] = "";
      element.removeAttribute(k);
    }
  }

  for (const k in nextProps) {
    if (k === "children" || k === "ref") continue;

    if (isEvent(k)) {
      if (prevProps?.[k] !== nextProps?.[k]) {
        eventNode.set(k, nextProps[k]);
      }
    } else if (k === "style") {
      element.setAttribute("style", convertStyleObjectToString(nextProps[k]));
    } else {
      const v = nextProps[k];
      // handle className -> class
      if (k === "className") element.setAttribute("class", v ?? "");
      else if (v === false || v === null || v === undefined)
        element.removeAttribute(k);
      else element.setAttribute(k, String(v));
    }
  }

  setEventHandlerListeners(element, eventNode);
};
