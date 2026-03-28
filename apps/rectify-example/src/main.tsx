import { createRoot, useState } from "@rectify-dev/core";
import styles from "./styles.module.css";

const Wrapper = () => {
  console.log("Wrapper");
  const [count, setCount] = useState(0);
  return (
    <>
      <h1
        ref={(node) => {
          console.log("node", node);
          return () => console.log("cleanup", node);
        }}
        onClick={() => setCount((p) => p + 1)}
        className={styles.red}
      >
        Hello world {count}
      </h1>
    </>
  );
};

createRoot(document.getElementById("app")!).render(<Wrapper />);
