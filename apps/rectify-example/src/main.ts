import { createRoot, jsx, useState, type FC } from "@rectify/core";

const Container: FC<{ count: number }> = ({ count }) => {
  console.log("container");
  return jsx("div", {
    children: ["Container ", count],
  });
};

const Counter = () => {
  console.log("Counter");
  const [count, setCount] = useState(1);
  return jsx("div", {
    onClick: (e) => {
      e.stopPropagation();
      setCount((p) => p + 1);
    },
    children: ["Counter ", count],
  });
};

const App = () => {
  console.log("App");
  const [count, setCount] = useState(1);
  return jsx("div", {
    id: "root",
    className: "hello",
    onClick: () => {
      setCount((p) => p + 1);
    },
    children: [
      jsx("h1", { children: "hello1" }),
      jsx(Container, { count }),
      jsx(Counter),
    ],
  });
};

createRoot(document.getElementById("app")!).render(jsx(App));
