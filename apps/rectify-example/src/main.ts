import {
  createRoot,
  jsx,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "@rectify/core";

const Tooltip = () => {
  const [count, setCount] = useState(0);

  const ref = useRef<HTMLDivElement>(null);

  const valueAA = useMemo(() => {
    console.log("valueAA");
    return "AA";
  }, []);

  useEffect(() => {
    console.log("count", count);
    if (count > 3) setCount(0);
  }, [count]);

  useLayoutEffect(() => {
    console.log(ref.current);
  }, []);

  return jsx("div", {
    children: [
      jsx("div", { children: [`Tooltip count: `, count, valueAA] }),
      jsx("button", {
        ref,
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
