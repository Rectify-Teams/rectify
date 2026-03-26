import { createRoot, jsx, useState } from "@rectify/core";

const Hr = () => jsx("hr");

const Counter = () => {
  console.log("Counter");
  const [count, setCount] = useState(0);
  return jsx("div", {
    id: "counter",
    children: [
      jsx("h1", { children: ["counter: ", count] }),
      jsx(Hr),
      jsx("button", {
        onClick: () => setCount((p) => p + 1),
        children: "click",
      }),
    ],
  });
};

const Content = () => {
  console.log("Content");
  const [mount, setMount] = useState(false);
  return jsx("div", {
    id: "content",
    children: [
      jsx("h2", { onClick: () => setMount((p) => !p), children: "content" }),
      mount && jsx(Counter),
      jsx(() => jsx("hr")),
    ],
  });
};

const App = () => {
  console.log("App_component");
  return jsx("div", {
    id: "App_component",
    children: [jsx("h1", { children: "App" }), jsx(Content)],
  });
};

createRoot(document.getElementById("app")!).render(jsx(App));
