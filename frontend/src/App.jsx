import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import AdminPanel from "./layouts/AdminPanel";
import UserPanel from "./layouts/UserPanel";
import { CircularProgress, Box, Typography } from "@mui/material";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Restaurar sesión al iniciar la app
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("❌ Error al leer usuario almacenado:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // 💾 Actualiza localStorage cuando el usuario cambia
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // ⏳ Pantalla de carga mientras se valida la sesión
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
          Cargando sesión...
        </Typography>
      </Box>
    );
  }

  return (
    <BrowserRouter basename="/">
      <Routes>
        {/* 🔐 Ruta pública: Login */}
        <Route path="/" element={<Login setUser={setUser} />} />

        {/* 🔒 Ruta protegida: Admin */}
        <Route
          path="/admin"
          element={
            user?.rol === "admin" ? (
              <AdminPanel />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* 🔒 Ruta protegida: Usuario */}
        <Route
          path="/usuario"
          element={
            user?.rol === "usuario" ? (
              <UserPanel />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* 🧭 Fallback: redirige todo lo desconocido al login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

