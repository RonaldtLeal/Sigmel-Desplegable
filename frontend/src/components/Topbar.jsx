import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { useEffect, useState } from "react";

export default function Topbar({ activeTab }) {
  const [time, setTime] = useState("");

  // 🕒 Actualiza el reloj cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const options = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };
      setTime(now.toLocaleTimeString("es-MX", options));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 📘 Diccionario de títulos por pestaña
  const titles = {
    dashboard: "Panel de Control",
    inventario: "Gestión de Inventario",
    prestamos: "Control de Préstamos",
    reportes: "Reportes del Sistema",
  };

  const currentTitle = titles[activeTab] || "SIGMEL";

  return (
    <AppBar
      position="sticky"
      elevation={3}
      sx={{
        background: "linear-gradient(90deg, #1565c0 0%, #0d47a1 100%)",
        height: 64,
        width: "100%",
        left: 0,
        top: 0,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 4,
          maxWidth: "100%",
        }}
      >
        {/* 📘 Título dinámico */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            letterSpacing: 0.6,
            fontSize: "1.1rem",
          }}
        >
          {currentTitle}
        </Typography>

        {/* ⏰ Reloj */}
        <Box
          sx={{
            backgroundColor: "rgba(255,255,255,0.15)",
            px: 2,
            py: 0.5,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "white",
              fontFamily: "monospace",
              letterSpacing: 1,
            }}
          >
            {time}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
