import { RectifyDomEventName } from "./RectifyEventName";

export const allNativeEvents: Set<RectifyDomEventName> = new Set();

export const registrationNameDependencies: {
  [registrationName: string]: Array<RectifyDomEventName>;
} = {};

export function registerDirectEvent(
  registrationName: string,
  dependencies: Array<RectifyDomEventName>,
) {
  registrationNameDependencies[registrationName] = dependencies;

  for (let i = 0; i < dependencies.length; i++) {
    allNativeEvents.add(dependencies[i]);
  }
}
