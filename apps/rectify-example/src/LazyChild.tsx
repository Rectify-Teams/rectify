import { useState } from "@rectify-dev/core";

const LazyChild = () => {
  const [count, setCount] = useState(0);
  return <div onClick={() => setCount((p) => p + 1)}>Lazy {count}</div>;
};

export default LazyChild;
