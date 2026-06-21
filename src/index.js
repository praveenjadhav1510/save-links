import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log("Service Worker registered with scope:", registration.scope);
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
