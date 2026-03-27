import {
  createRoot,
  jsx,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "@rectify/core";

const Counter = ({ onClick }: { onClick: () => void }) => {
  console.log("Counter");

  return jsx("div", { children: "Counter", onClick });
};

const Content = () => {
  console.log("Content");

  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => setCount((c) => c + 1), []);

  return jsx("div", {
    children: [
      jsx("h1", { children: `Count: ${count}` }),
      jsx(Counter, { onClick: handleClick }),
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
