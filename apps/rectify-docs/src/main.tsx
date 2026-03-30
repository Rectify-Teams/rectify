import { createRoot } from "@rectify-dev/core";
import App from "./App";
import "./styles/global.css";

createRoot(document.getElementById("app")!).render(<App />);
