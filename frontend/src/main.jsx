import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// 🚀 Punto de entrada principal de la app
const rootElement = document.getElementById("root");

// 🧠 Comprobamos que el elemento raíz exista antes de renderizar
if (!rootElement) {
  console.error("❌ No se encontró el elemento #root en el HTML");
} else {
  const root = createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
