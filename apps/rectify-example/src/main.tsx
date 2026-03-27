import { createRoot } from "@rectify-dev/core";
import styles from "./styles.module.css";

const Wrapper = () => {
  console.log("Wrapper");
  return (
    <>
      <h1 className={styles.red}>Hello world</h1>
    </>
  );
};

createRoot(document.getElementById("app")!).render(<Wrapper />);
