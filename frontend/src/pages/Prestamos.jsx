import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  Alert,
} from "@mui/material";
import axios from "axios";

// 🌐 URL dinámica del backend (Render o local)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Prestamos() {
  const [prestamos, setPrestamos] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [alerta, setAlerta] = useState({ tipo: "", mensaje: "" });

  const user = JSON.parse(localStorage.getItem("user"));

  // 🔹 Cargar préstamos del usuario o admin
  const cargarPrestamos = async () => {
    if (!user) {
      setErrorMsg("No hay sesión activa. Vuelve a iniciar sesión.");
      return;
    }

    try {
      setErrorMsg("");

      const endpoint =
        user.rol === "admin"
          ? `${API_URL}/api/prestamos`
          : `${API_URL}/api/prestamos/usuario/${user.id}`;

      const res = await axios.get(endpoint);
      setPrestamos(res.data || []);
    } catch (err) {
      console.error("❌ Error al obtener préstamos:", err);
      setErrorMsg("No se pudo conectar con el servidor o no hay datos disponibles.");
    }
  };

  useEffect(() => {
    cargarPrestamos();
  }, []);

  // 🔹 Cambiar estado del préstamo (solo admin)
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      setLoadingId(id);
      await axios.put(`${API_URL}/api/prestamos/cambiarEstado/${id}`, {
        estado: nuevoEstado,
      });
      setAlerta({
        tipo: "success",
        mensaje: `✅ Estado cambiado a "${nuevoEstado}".`,
      });
      await cargarPrestamos();
    } catch (err) {
      console.error("❌ Error al cambiar estado:", err);
      setAlerta({
        tipo: "error",
        mensaje: "Error al cambiar el estado del préstamo.",
      });
    } finally {
      setLoadingId(null);
    }
  };

  // 🔹 Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleString("es-MX", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 🎨 Colores según estado
  const colorEstado = (estado) => {
    switch (estado) {
      case "reservado":
        return "warning";
      case "prestado":
        return "info";
      case "devuelto":
        return "success";
      default:
        return "default";
    }
  };

  // 👨‍💻 Agrupar préstamos por usuario (solo admin)
  const prestamosPorUsuario =
    user?.rol === "admin"
      ? prestamos.reduce((acc, p) => {
          const usuario = p.usuario || "Desconocido";
          if (!acc[usuario]) acc[usuario] = [];
          acc[usuario].push(p);
          return acc;
        }, {})
      : {};

  return (
    <Paper sx={{ p: 3, boxShadow: 3, backgroundColor: "#fafafa" }}>
      <Typography
        variant="h5"
        sx={{ mb: 3, fontWeight: "bold", color: "#0d47a1" }}
      >
        {user?.rol === "admin" ? "Gestión de Préstamos" : "Mis Préstamos"}
      </Typography>

      {/* ⚠️ Error general */}
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* ⚙️ Alerta dinámica */}
      {alerta.mensaje && (
        <Alert
          severity={alerta.tipo}
          sx={{ mb: 2 }}
          onClose={() => setAlerta({ tipo: "", mensaje: "" })}
        >
          {alerta.mensaje}
        </Alert>
      )}

      {/* 👨‍💻 Vista ADMIN */}
      {user?.rol === "admin" ? (
        Object.keys(prestamosPorUsuario).length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No hay préstamos registrados.
          </Typography>
        ) : (
          Object.keys(prestamosPorUsuario).map((usuario) => (
            <Paper
              key={usuario}
              sx={{
                mb: 4,
                p: 2,
                backgroundColor: "#ffffff",
                borderRadius: 2,
                boxShadow: 2,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mb: 2, color: "#1a237e" }}
              >
                {usuario} — {prestamosPorUsuario[usuario].length} préstamo(s)
              </Typography>

              <Table>
                <TableHead sx={{ backgroundColor: "#e3f2fd" }}>
                  <TableRow>
                    <TableCell><b>Material</b></TableCell>
                    <TableCell><b>Cantidad</b></TableCell>
                    <TableCell><b>Fecha</b></TableCell>
                    <TableCell><b>Estado</b></TableCell>
                    <TableCell><b>Acciones</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {prestamosPorUsuario[usuario].map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>{p.material || "-"}</TableCell>
                      <TableCell>{p.cantidad}</TableCell>
                      <TableCell>{formatearFecha(p.fecha_prestamo)}</TableCell>
                      <TableCell>
                        <Chip
                          label={p.estado}
                          color={colorEstado(p.estado)}
                          size="small"
                          sx={{
                            textTransform: "capitalize",
                            fontWeight: "bold",
                            minWidth: "90px",
                            textAlign: "center",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {p.estado === "reservado" && (
                          <Button
                            onClick={() => cambiarEstado(p.id, "prestado")}
                            size="small"
                            color="primary"
                            variant="contained"
                            disabled={loadingId === p.id}
                          >
                            {loadingId === p.id ? (
                              <CircularProgress size={20} />
                            ) : (
                              "Prestar"
                            )}
                          </Button>
                        )}
                        {p.estado === "prestado" && (
                          <Button
                            onClick={() => cambiarEstado(p.id, "devuelto")}
                            size="small"
                            color="success"
                            variant="contained"
                            disabled={loadingId === p.id}
                          >
                            {loadingId === p.id ? (
                              <CircularProgress size={20} />
                            ) : (
                              "Devolver"
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          ))
        )
      ) : (
        // 👤 Vista USUARIO
        <Grid container spacing={3}>
          {prestamos.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", width: "100%" }}
            >
              No tienes préstamos registrados.
            </Typography>
          ) : (
            prestamos.map((p) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
                <Card
                  sx={{
                    boxShadow: 4,
                    borderRadius: 3,
                    transition: "0.3s",
                    "&:hover": { transform: "translateY(-5px)", boxShadow: 6 },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="160"
                    image={
                      p.imagen
                        ? `${API_URL}/uploads/${p.imagen}`
                        : "https://via.placeholder.com/200x150?text=Sin+Imagen"
                    }
                    alt={p.material}
                    sx={{
                      objectFit: "contain",
                      backgroundColor: "#f5f5f5",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  />
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: "bold" }}
                    >
                      {p.material}
                    </Typography>
                    <Typography variant="body2">
                      <b>Cantidad:</b> {p.cantidad}
                    </Typography>
                    <Typography variant="body2">
                      <b>Fecha:</b> {formatearFecha(p.fecha_prestamo)}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={p.estado}
                        color={colorEstado(p.estado)}
                        size="small"
                        sx={{
                          textTransform: "capitalize",
                          fontWeight: "bold",
                          minWidth: "90px",
                          textAlign: "center",
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Paper>
  );
}
