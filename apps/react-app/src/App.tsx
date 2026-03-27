import { useLayoutEffect, useState } from "react";

const Tooltip = () => {
  const [count, setCount] = useState(0);

  useLayoutEffect(() => {
    console.log("count", count);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (count > 3) setCount(0);
  }, [count]);

  return (
    <div>
      <div>{`Tooltip count: ${count}`}</div>
      <button onClick={() => setCount((p) => p + 1)}>click</button>
    </div>
  );
};

const App = () => {
  return (
    <div id="root" className="hello">
      <Tooltip />
    </div>
  );
};

export default App;
