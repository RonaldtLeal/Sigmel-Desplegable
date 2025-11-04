import { useState, useEffect } from "react";
import { Box, CssBaseline } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Inventario from "../pages/Inventario";
import Prestamos from "../pages/Prestamos";

export default function UserPanel() {
  const [activeTab, setActiveTab] = useState("inventario");
  const [inventario, setInventario] = useState([]);
  const [prestamos, setPrestamos] = useState([]);

  useEffect(() => {
    // Ejemplo simulado (puedes reemplazar con fetch real)
    setInventario([
      { id: 1, nombre: "Protoboard", cantidad: 10 },
      { id: 2, nombre: "Arduino UNO", cantidad: 8 },
      { id: 3, nombre: "Multímetro", cantidad: 4 },
    ]);

    setPrestamos([
      { usuario: "Eric Joan Santos Nanny", material: "Multímetro", fecha: "2025-08-10" },
      { usuario: "Eric Joan Santos Nanny", material: "Protoboard", fecha: "2025-08-05" },
    ]);
  }, []);

  return (
    <Box sx={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <CssBaseline />

      {/*  Sidebar fija */}
      <Sidebar setActiveTab={setActiveTab} />

      {/*  Contenido principal */}
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
        {/*  Barra superior */}
        <Topbar />

        {/*  Contenido dinámico */}
        <Box sx={{ flexGrow: 1, p: 4 }}>
          {activeTab === "inventario" && <Inventario inventario={inventario} />}
          {activeTab === "prestamos" && <Prestamos prestamos={prestamos} />}
        </Box>
      </Box>
    </Box>
  );
}
