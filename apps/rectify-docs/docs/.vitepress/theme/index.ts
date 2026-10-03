import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import DelegationScaleAnimation from "./components/DelegationScaleAnimation.vue";
import DispatchFlowAnimation from "./components/DispatchFlowAnimation.vue";
import Playground from "./components/Playground.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("DelegationScaleAnimation", DelegationScaleAnimation);
    app.component("DispatchFlowAnimation", DispatchFlowAnimation);
    app.component("Playground", Playground);
  },
} satisfies Theme;
