import { useState } from "react";

const Counter = () => {
  console.log("Counter");
  const [count, setCount] = useState(1);
  return <div onClick={() => setCount((p) => p + 1)}>Counter {count}</div>;
};

const Container = ({ count }: { count: number }) => {
  return (
    <div
      onClick={(e) => {
        // e.stopPropagation();
        console.log("container", e.currentTarget);
      }}
    >
      Container {count}
    </div>
  );
};

const App = () => {
  const [count, setCount] = useState(1);
  const [mount, setMount] = useState(false);
  return (
    <div
      id="root"
      className="hello"
      onClick={() => {
        console.log("App");
        setMount((p) => !p);
      }}
    >
      hello1
      <Container count={count} />
      {mount ? <Counter /> : 2}
      {mount ? 2003 : 2}
    </div>
  );
};

export default App;
