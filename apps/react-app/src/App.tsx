import { useState } from "react";

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
  return (
    <div
      id="root"
      className="hello"
      onClickCapture={() => {
        console.log("App");
        setCount((p) => p + 1);
      }}
    >
      hello1
      <Container count={count} />
    </div>
  );
};

export default App;
