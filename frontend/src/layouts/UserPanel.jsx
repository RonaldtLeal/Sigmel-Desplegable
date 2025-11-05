import { useState, useEffect } from "react";
import { Box, CssBaseline, CircularProgress, Typography, Button } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Inventario from "../pages/Inventario";
import Prestamos from "../pages/Prestamos";
import axios from "axios";

export default function UserPanel() {
  const [activeTab, setActiveTab] = useState("inventario");
  const [inventario, setInventario] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🌍 URL dinámica (Render o local)
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const user = JSON.parse(localStorage.getItem("user"));

  // 🔁 Cargar datos reales del backend
  const fetchData = async () => {
    setLoading(true);
    try {
      // Obtener materiales
      const resInventario = await axios.get(`${API_URL}/api/materiales`);
      setInventario(Array.isArray(resInventario.data) ? resInventario.data : []);

      // Obtener préstamos del usuario
      if (user?.id) {
        const resPrestamos = await axios.get(`${API_URL}/api/prestamos/usuario/${user.id}`);
        setPrestamos(Array.isArray(resPrestamos.data) ? resPrestamos.data : []);
      }

      setError(null);
    } catch (err) {
      console.error("❌ Error al conectar con el servidor:", err);
      setError("No se pudo conectar con el servidor SIGMEL.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
          Cargando información del laboratorio...
        </Typography>
      </Box>
    );
  }

  // ⚠️ Error de conexión
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
          Intenta recargar la página o verifica la conexión.
        </Typography>
        <Button variant="contained" color="primary" onClick={fetchData}>
          Reintentar conexión
        </Button>
      </Box>
    );
  }

  // ✅ Vista principal
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
        {/* 📌 Barra superior */}
        <Topbar />

        {/* 📦 Contenido dinámico */}
        <Box sx={{ flexGrow: 1, p: 4 }}>
          {activeTab === "inventario" && (
            <Inventario inventario={inventario} recargar={fetchData} />
          )}
          {activeTab === "prestamos" && <Prestamos prestamos={prestamos} />}
        </Box>
      </Box>
    </Box>
  );
}
