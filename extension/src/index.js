import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

function startApp() {
  const el = document.getElementById("youtube-interact-mode-root");
  if (!el) return;
  const root = createRoot(el);
  root.render(<App />);
}

startApp(); 