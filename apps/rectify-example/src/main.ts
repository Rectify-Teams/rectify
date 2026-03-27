import { createRoot, jsx, useEffect, useRef, useState } from "@rectify/core";

const App = () => {
  const [inputValue, setInputValue] = useState("");
  // useRef for a DOM node – focus the input on mount
  const inputRef = useRef<HTMLInputElement>(null);
  // useRef for a mutable value – track render count without re-rendering
  const renderCount = useRef(0);
  renderCount.current += 1;

  useEffect(() => {
    (inputRef.current as HTMLInputElement | null)?.focus();
  }, []);

  useEffect(() => {
    console.log("Input value changed:", inputValue);
    return () => {
      console.log("Cleaning up after input value change:", inputValue);
    };
  }, [inputValue]);

  return jsx("div", {
    children: [
      jsx("p", { children: `Renders: ${renderCount.current}` }),
      jsx("input", {
        ref: inputRef,
        value: inputValue,
        onInput: (e: any) => setInputValue(e.target.value),
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
