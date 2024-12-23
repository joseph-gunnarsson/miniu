import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/index.css";
import { BrowserRouter } from "react-router";
import { App } from "./app/App";

createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>

);
