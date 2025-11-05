import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// 🚀 Punto de entrada principal de la app
const rootElement = document.getElementById("root");

// 🧠 Comprobación preventiva antes de renderizar
if (!rootElement) {
  console.error("❌ No se encontró el elemento #root en el documento HTML");
} else {
  const root = createRoot(rootElement);

  // 🧩 Render principal dentro de StrictMode
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// 🔍 Log para confirmar entorno
console.log(
  `🌐 Aplicación iniciada en modo ${
    import.meta.env.MODE
  }. Backend: ${import.meta.env.VITE_API_URL || "http://localhost:4000"}`
);
