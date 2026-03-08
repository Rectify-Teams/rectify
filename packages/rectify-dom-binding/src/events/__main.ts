import { registerNativeEvent } from "./RectifyEventRegistry";

/**
 * This function will run immediately when this file mount
 */
const main = () => {
  registerNativeEvent();
};

main();
