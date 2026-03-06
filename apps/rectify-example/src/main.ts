import { createRoot, jsx } from "@rectify/core";

const Container = () => jsx("div", { children: "hello" });

const App = () => {
  return jsx("div", {
    children: ["hello1", jsx(Container), false],
  });
};

createRoot(document.getElementById("app")!).render(jsx(App));
