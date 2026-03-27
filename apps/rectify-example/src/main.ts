import {
  createRoot,
  jsx,
  useEffect,
  useLayoutEffect,
  useState,
} from "@rectify/core";

const Tooltip = () => {
  const [count, setCount] = useState(0);

  useLayoutEffect(() => {
    console.log("count", count);
    if (count > 3) setCount(0);
  }, [count]);

  return jsx("div", {
    children: [
      jsx("div", { children: [`Tooltip count: `, count] }),
      jsx("button", {
        onClick: () => setCount((p) => p + 1),
        children: ["click"],
      }),
    ],
  });
};

const App = () => {
  console.log("App");

  return jsx("div", {
    children: [jsx(Tooltip)],
  });
};

createRoot(document.getElementById("app")!).render(jsx(App));
