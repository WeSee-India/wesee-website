import { createRoot } from "react-dom/client";
import App from "./App";
import { startContentSync } from "./content";
import "./index.css";

startContentSync();
createRoot(document.getElementById("root")!).render(<App />);
