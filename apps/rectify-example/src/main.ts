import { createRoot, jsx, useState, type FC } from "@rectify/core";

const Container: FC<{ count: number }> = ({ count }) =>
  jsx("div", { children: ["hello ", count] });

const App = () => {
  const [count, setCount] = useState(1);
  return jsx("div", {
    id: 'root',
    className: 'hello',
    onClick: () => {
      console.log("helo");
      setCount((p) => p + 1);
    },
    children: ["hello1", jsx(Container, { count }), false],
  });
};

createRoot(document.getElementById("app")!).render(jsx(App));
