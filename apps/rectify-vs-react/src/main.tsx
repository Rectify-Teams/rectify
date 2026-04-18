import { createRoot } from "@rectify-dev/core";
import { App } from "./App";

const root = document.getElementById("root");
if (root) createRoot(root).render(<App />);
