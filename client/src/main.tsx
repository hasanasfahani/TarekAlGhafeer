import { createRoot } from "react-dom/client";
import App from "./AppTarek";
import "./index.css";
import { CoachProvider } from "./lib/coach";

createRoot(document.getElementById("root")!).render(
  <CoachProvider>
    <App />
  </CoachProvider>,
);
