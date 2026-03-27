import { createRoot, jsx, useEffect, useState } from "@rectify/core";

const App = () => {
  console.log("App_component");
  const [list, setList] = useState<{ title: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate network delay

    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await res.json();
    setList(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return jsx("div", {
    id: "App_component",
    children: [
      jsx("h1", { children: "App" }),
      loading
        ? jsx("p", { children: "Loading..." })
        : jsx("ul", {
            children: list.map((item) =>
              jsx("li", { key: item.title, children: item.title }),
            ),
          }),
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
