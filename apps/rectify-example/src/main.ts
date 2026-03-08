import {
  createRoot,
  jsx,
  SyntheticEvent,
  useState,
  type FC,
} from "@rectify/core";

const Container: FC<{ count: number }> = ({ count }) =>
  jsx("div", {
    onClick: (e: SyntheticEvent) => {
      // e.stopPropagation();
      console.log("container", e);
    },
    children: ["Container ", count],
  });

const App = () => {
  const [count, setCount] = useState(1);
  return jsx("div", {
    id: "root",
    className: "hello",
    onClick: (e: SyntheticEvent) => {
      // e.stopPropagation();
      console.log("App", e.target);
      setCount((p) => p + 1);
    },
    children: ["hello1", jsx(Container, { count }), false],
  });
};

createRoot(document.getElementById("app")!).render(jsx(App));
  