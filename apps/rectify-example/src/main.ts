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
  const [mount, setMount] = useState(false);
  return jsx("div", {
    id: "root",
    className: "hello",
    onClick: () => {
      setMount((p) => !p);
    },
    children: [
      mount
        ? jsx(Container, { count: 1984 })
        : jsx("h1", { children: "Heading" }),
      mount && jsx(Counter),
      jsx("button", {
        style: { backgroundColor: mount ? "red" : "transparent" },
        children: "click",
      }),
    ],
  });
};

createRoot(document.getElementById("app")!).render(jsx(App));
