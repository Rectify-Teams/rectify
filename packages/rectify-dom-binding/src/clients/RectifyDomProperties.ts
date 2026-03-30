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

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * SVG attributes that are genuinely camelCase in the SVG spec and must NOT
 * be converted to kebab-case when calling setAttribute.
 */
const SVG_CAMEL_ATTRS = new Set([
  "viewBox", "preserveAspectRatio",
  "gradientTransform", "gradientUnits",
  "patternTransform", "patternUnits", "patternContentUnits",
  "clipPathUnits", "markerUnits", "markerWidth", "markerHeight",
  "refX", "refY",
  "textLength", "startOffset",
  "baseFrequency", "numOctaves", "stdDeviation",
  "filterUnits", "primitiveUnits",
  "tableValues", "kernelMatrix", "kernelUnitLength",
  "targetX", "targetY",
  "xChannelSelector", "yChannelSelector",
  "diffuseConstant", "surfaceScale",
  "specularConstant", "specularExponent",
  "limitingConeAngle",
  "pointsAtX", "pointsAtY", "pointsAtZ",
  "repeatX", "repeatY",
]);

/** Converts camelCase to kebab-case, e.g. strokeWidth → stroke-width. */
const camelToKebab = (s: string) =>
  s.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

/** Returns the correct attribute name for an SVG element's prop key. */
const svgAttrName = (k: string): string =>
  SVG_CAMEL_ATTRS.has(k) ? k : camelToKebab(k);

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
  const isSvg = element.namespaceURI === SVG_NS;

  const eventNode =
    getEventHandlerListeners(element) ||
    new Map<RectifyDomEventName, RectifyDOMEventHandleListener>();

  for (const k in prevProps) {
    if (isEvent(k) && !(k in nextProps)) {
      eventNode.delete(k as RectifyDomEventName);
    }
    if (isProperty(k) && !(k in nextProps)) {
      const attrName = isSvg ? svgAttrName(k) : k;
      (element as any)[k] = "";
      element.removeAttribute(attrName);
    }
  }

  for (const k in nextProps) {
    if (k === "children" || k === "ref") continue;

    if (isEvent(k)) {
      if (prevProps?.[k] !== nextProps?.[k]) {
        eventNode.set(k, nextProps[k]);
      }
    } else if (k === "style") {
      if (typeof nextProps[k] === "string") {
        element.setAttribute("style", nextProps[k]);
      } else {
        element.setAttribute("style", convertStyleObjectToString(nextProps[k]));
      }
    } else {
      const v = nextProps[k];
      if (k === "className") {
        element.setAttribute("class", v ?? "");
      } else if (v === false || v === null || v === undefined) {
        const attrName = isSvg ? svgAttrName(k) : k;
        element.removeAttribute(attrName);
      } else {
        const attrName = isSvg ? svgAttrName(k) : k;
        element.setAttribute(attrName, String(v));
      }
    }
  }

  setEventHandlerListeners(element, eventNode);
};
