import {
  createContext,
  createRoot,
  Fragment,
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

    return (
      <ThemeCtx.Provider value={value}>
        {props.children}
      </ThemeCtx.Provider>
    );
  },
  () => true,
);

const ChildThem = () => {
  console.log("ChildThem");

  const { theme, updateValue } = useContext(ThemeCtx)!;
  return (
    <div onClick={() => updateValue(theme === "light" ? "dark" : "light")}>
      {theme}
    </div>
  );
};

const Theme = () => {
  console.log("Theme");
  return (
    <ThemeProvider>
      <ChildThem />
    </ThemeProvider>
  );
};

type Cxt = {
  value: number;
  updateValue: (newValue: number | ((prev: number) => number)) => void;
};

const CounterContext = createContext<Cxt | null>(null);

const Child = () => {
  console.log("Child");

  const { value } = useContext(CounterContext)!;
  return (
    <div>
      <h1>{value}</h1>
      <Theme />
    </div>
  );
};

const Button = () => {
  console.log("Button");

  const { value, updateValue } = useContext(CounterContext)!;
  return (
    <div onClick={() => updateValue(value + 1)}>
      click
    </div>
  );
};

const Hr = () => {
  console.log("Hr");
  return <hr />;
};

const App = () => {
  console.log("App");
  const [count, setCount] = useState(0);

  const value = useMemo(
    () => ({ value: count, updateValue: setCount }),
    [count],
  );

  return (
    <CounterContext.Provider value={value}>
      <Child />
      <Button />
      <Hr />
    </CounterContext.Provider>
  );
};

const Wrapper = () => {
  console.log("Wrapper");
  return (
    <>
      <App />
      <h1>Hello world</h1>
    </>
  );
};

createRoot(document.getElementById("app")!).render(<Wrapper />);
