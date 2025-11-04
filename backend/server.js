const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const db = require("./db");

// 📁 Importar rutas
const authRoutes = require("./routes/auth");
const materialesRoutes = require("./routes/materiales");
const prestamosRoutes = require("./routes/prestamos");
const dashboardRoutes = require("./routes/dashboard");
const reportesRoutes = require("./routes/reportes");

const app = express();
const PORT = process.env.PORT || 4000;

// 🧩 Middleware global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🖼️ Servir imágenes del directorio /uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 📦 Rutas API
app.use("/api", authRoutes);
app.use("/api", materialesRoutes);
app.use("/api/prestamos", prestamosRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reportes", reportesRoutes);

// 🌐 Servir el frontend compilado (modo producción)
const clientPath = path.join(__dirname, "public");
app.use(express.static(clientPath));

// 🛠️ Capturar cualquier otra ruta y devolver index.html (Express 5)
app.use((req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log("🖼️ Carpeta de imágenes disponible en /uploads");
});
