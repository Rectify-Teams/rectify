import { RectifyElement } from "../RectifyTypes";
import { isPlainObject } from "./common";

export const isValidRectifyElement = (v: unknown): v is RectifyElement => {
  if (isPlainObject(v)) {
    return v.hasOwnProperty("$$typeof") && v.hasOwnProperty("type");
  }
  return false;
};
