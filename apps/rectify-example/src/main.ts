import { createRoot, jsx, useCallback, useState } from "@rectify/core";

const Counter = ({ onIncrement }: { onIncrement: () => void }) => {
  console.log("Counter");
  return jsx("div", {
    children: [
      jsx("button", {
        onClick: onIncrement,
        children: ["Increment"],
      }),
    ],
  });
};

const Content = () => {
  console.log("Content");
  const [count, setCount] = useState(0);

  const handleIncrement = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  return jsx("div", {
    children: [
      jsx("div", { children: [`Count: `, count] }),
      jsx(Counter, { onIncrement: handleIncrement }),
    ],
  });
};

const App = () => {
  console.log("App");

  return jsx("div", {
    children: [jsx(Content)],
  });
};

createRoot(document.getElementById("app")!).render(jsx(App));
