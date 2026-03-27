import {
  createContext,
  createRoot,
  jsx,
  memo,
  useContext,
  useMemo,
  useState,
} from "@rectify/core";

type TCxt = {
  theme: "light" | "dark";
  updateValue: (
    newValue: "light" | "dark" | ((prev: "light" | "dark") => "light" | "dark"),
  ) => void;
};

const ThemeCtx = createContext<TCxt | null>(null);

const ThemeProvider = memo(
  (props: { children?: any }) => {
    console.log("ThemeProvider");

    const [theme, setTheme] = useState<"light" | "dark">("light");

    const value = useMemo(() => ({ theme, updateValue: setTheme }), [theme]);

    return jsx(ThemeCtx.Provider, {
      value: value,
      children: props.children,
    });
  },
  () => true,
);

const ChildThem = () => {
  console.log("ChildThem");

  const { theme, updateValue } = useContext(ThemeCtx)!;
  return jsx("div", {
    children: theme,
    onClick: () => updateValue(theme === "light" ? "dark" : "light"),
  });
};

const Theme = () => {
  console.log("Theme");
  return jsx(ThemeProvider, { children: jsx(ChildThem) });
};

type Cxt = {
  value: number;
  updateValue: (newValue: number | ((prev: number) => number)) => void;
};

const CounterContext = createContext<Cxt | null>(null);

const Child = () => {
  console.log("Child");

  const { value } = useContext(CounterContext)!;
  return jsx("div", {
    children: [jsx("h1", { children: value }), jsx(Theme)],
  });
};

const Button = () => {
  console.log("Button");

  const { value, updateValue } = useContext(CounterContext)!;
  return jsx("div", {
    onClick: () => updateValue(value + 1),
    children: "click",
  });
};

const Hr = () => {
  console.log("Hr");
  return jsx("hr");
};

const App = () => {
  console.log("App");
  const [count, setCount] = useState(0);

  const value = useMemo(
    () => ({ value: count, updateValue: setCount }),
    [count],
  );

  return jsx(CounterContext.Provider, {
    value: value,
    children: [jsx(Child), jsx(Button), jsx(Hr)],
  });
};

const Wrapper = () => {
  console.log("Wrapper");
  return jsx(App);
};

createRoot(document.getElementById("app")!).render(jsx(Wrapper));
