import {
  RECTIFY_ELEMENT_TYPE,
  RECTIFY_FRAGMENT_TYPE,
  RECTIFY_TEXT_TYPE,
  RECTIFY_PORTAL_TYPE,
} from "../constants";
import { RectifyElement, RectifyIgnorable, RectifyNode } from "../types";
import { isBool, isPlainObject, isTextNode } from "./common";

export const isValidRectifyElement = (v: unknown): v is RectifyElement => {
  if (isPlainObject(v)) {
    const elementTypes = [
      RECTIFY_ELEMENT_TYPE,
      RECTIFY_FRAGMENT_TYPE,
      RECTIFY_TEXT_TYPE,
      RECTIFY_PORTAL_TYPE,
    ];
    return (
      v.hasOwnProperty("$$typeof") &&
      v.hasOwnProperty("type") &&
      elementTypes.includes(v.$$typeof)
    );
  }
  return false;
};

export const isRectifyIgnorable = (v: unknown): v is RectifyIgnorable =>
  v === null || v === undefined || isBool(v);

export const createElementFromRectifyNode = (
  node: RectifyNode,
): RectifyElement | null => {
  if (isValidRectifyElement(node)) return node;

  if (isTextNode(node)) {
    return {
      $$typeof: RECTIFY_TEXT_TYPE,
      key: null,
      type: null,
      props: node,
    };
  }

  if (isRectifyIgnorable(node)) {
    return null;
  }
  return null;
};

export const isElementType = (v: unknown, type: symbol) =>
  isValidRectifyElement(v) && v.$$typeof === type;
