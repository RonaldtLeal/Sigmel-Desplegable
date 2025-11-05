import { useState, useEffect } from "react";
import { Box, CssBaseline, CircularProgress, Typography, Button } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Dashboard from "../pages/Dashboard";
import Inventario from "../pages/Inventario";
import Prestamos from "../pages/Prestamos";
import Reportes from "../pages/Reportes";
import axios from "axios";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [inventario, setInventario] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🌍 URL dinámica (Render o local)
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // 🔁 Cargar materiales desde el backend
  const fetchInventario = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/materiales`);
      if (Array.isArray(res.data)) {
        setInventario(res.data);
      } else {
        console.warn("⚠️ Respuesta inesperada del servidor:", res.data);
        setInventario([]);
      }
      setError(null);
    } catch (err) {
      console.error("❌ Error al obtener materiales:", err);
      setError("Error al obtener los materiales desde el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // 🧠 Simulación temporal de préstamos y usuarios
  useEffect(() => {
    fetchInventario();

    setPrestamos([
      { usuario: "Juan Pérez", material: "Osciloscopio", fecha: "2025-08-01" },
      { usuario: "Ana López", material: "Protoboard", fecha: "2025-08-02" },
    ]);

    setUsuarios([
      { id: 1, nombre: "Juan Pérez" },
      { id: 2, nombre: "Ana López" },
    ]);
  }, []);

  // ⏳ Pantalla de carga
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#f5f6fa",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando datos del sistema...
        </Typography>
      </Box>
    );
  }

  // ⚠️ Si hay error de conexión
  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#f5f6fa",
          textAlign: "center",
          px: 3,
        }}
      >
        <Typography variant="h5" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Verifica la conexión con el servidor SIGMEL.
        </Typography>
        <Button variant="contained" color="primary" onClick={fetchInventario}>
          Reintentar conexión
        </Button>
      </Box>
    );
  }

  // ✅ Vista principal del panel
  return (
    <Box sx={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <CssBaseline />

      {/* 📘 Sidebar fija */}
      <Sidebar setActiveTab={setActiveTab} />

      {/* 📄 Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: "#f5f6fa",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* 📌 Topbar */}
        <Topbar />

        {/* 📦 Contenido dinámico */}
        <Box sx={{ flexGrow: 1, p: 4 }}>
          {activeTab === "dashboard" && (
            <Dashboard inventario={inventario} prestamos={prestamos} usuarios={usuarios} />
          )}
          {activeTab === "inventario" && (
            <Inventario inventario={inventario} recargar={fetchInventario} />
          )}
          {activeTab === "prestamos" && <Prestamos prestamos={prestamos} />}
          {activeTab === "reportes" && <Reportes />}
        </Box>
      </Box>
    </Box>
  );
}
