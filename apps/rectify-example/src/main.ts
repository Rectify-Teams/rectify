import { createRoot, jsx, useEffect, useState } from "@rectify/core";

const App = () => {
  const [inputValue, setInputValue] = useState("");

  return jsx("div", {
    children: [
      jsx("input", {
        value: inputValue,
        onInput: (e) => setInputValue(e.target.value),
      }),
      jsx("p", { children: `You typed: ${inputValue}` }),
    ],
  });
};

const Wrapper = () => {
  const [mount, setMount] = useState(false);

  return jsx("div", {
    id: "Wrapper_component",
    children: [
      jsx("button", { children: "click", onClick: () => setMount((p) => !p) }),
      mount && jsx(App),
    ],
  });
};

createRoot(document.getElementById("app")!).render(jsx(Wrapper));
