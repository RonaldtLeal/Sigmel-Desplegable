import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Button,
  CardActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Divider,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

// 🌐 URL dinámica del backend (Render o local)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Inventario() {
  const [materiales, setMateriales] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");
  const [errorMsg, setErrorMsg] = useState("");
  const [reserva, setReserva] = useState([]);
  const [alerta, setAlerta] = useState({ tipo: "", mensaje: "" });
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  const categorias = [
    "Instrumentos de medición",
    "Elementos pasivos",
    "Elementos activos",
    "Varios",
    "Herramientas",
  ];

  // 🔹 Cargar materiales al montar
  useEffect(() => {
    obtenerMateriales();
  }, []);

  // 🔹 Obtener materiales desde el backend
  const obtenerMateriales = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/materiales`);
      setMateriales(Array.isArray(res.data) ? res.data : []);
      setErrorMsg("");
    } catch (err) {
      console.error("❌ Error al obtener materiales:", err);
      setErrorMsg("No se pudo conectar con el servidor SIGMEL.");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Agregar al carrito de reserva
  const agregarReserva = (material) => {
    const existente = reserva.find((m) => m.id === material.id);
    if (existente) {
      setReserva(
        reserva.map((m) =>
          m.id === material.id
            ? { ...m, cantidad_reservada: m.cantidad_reservada + 1 }
            : m
        )
      );
    } else {
      setReserva([...reserva, { ...material, cantidad_reservada: 1 }]);
    }
  };

  // 🧩 Quitar del carrito
  const quitarDelCarrito = (id) => {
    setReserva(reserva.filter((item) => item.id !== id));
  };

  // 🧩 Cambiar cantidad reservada
  const cambiarCantidad = (id, delta) => {
    setReserva(
      reserva.map((item) => {
        if (item.id === id) {
          const nuevaCantidad = item.cantidad_reservada + delta;
          return nuevaCantidad > 0
            ? { ...item, cantidad_reservada: nuevaCantidad }
            : item;
        }
        return item;
      })
    );
  };

  // 🧩 Confirmar reserva (con backend real)
  const confirmarReserva = async () => {
    try {
      if (reserva.length === 0) {
        setAlerta({ tipo: "warning", mensaje: "No hay materiales en el carrito." });
        return;
      }

      for (let item of reserva) {
        await axios.post(`${API_URL}/api/prestamos/reservar`, {
          usuario_id: user.id,
          material_id: item.id,
          cantidad: item.cantidad_reservada,
        });
      }

      setReserva([]);
      obtenerMateriales();
      setAlerta({ tipo: "success", mensaje: "✅ Reserva registrada correctamente." });
    } catch (err) {
      console.error("❌ Error al confirmar reserva:", err);
      setAlerta({
        tipo: "error",
        mensaje: "Error al confirmar la reserva. Intenta nuevamente.",
      });
    }
  };

  // 🕐 Pantalla de carga
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
          Cargando materiales disponibles...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#0d47a1" }}
      >
        Catálogo de Materiales
      </Typography>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {alerta.mensaje && (
        <Alert
          severity={alerta.tipo}
          sx={{ mb: 2 }}
          onClose={() => setAlerta({ tipo: "", mensaje: "" })}
        >
          {alerta.mensaje}
        </Alert>
      )}

      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 3 }}
      >
        <Tab label="Ver Inventario" />
        {user?.rol === "admin" && <Tab label="Agregar Material (modo local)" />}
      </Tabs>

      {/* =====================================================
          🧾 TAB 1: VER INVENTARIO
      ===================================================== */}
      {tabValue === 0 && (
        <Box>
          <FormControl sx={{ mb: 3, minWidth: 250 }}>
            <InputLabel>Filtrar por Categoría</InputLabel>
            <Select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              label="Filtrar por Categoría"
            >
              <MenuItem value="Todos">Todos</MenuItem>
              {categorias.map((cat, i) => (
                <MenuItem key={i} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 🛒 Carrito de reserva (usuarios) */}
          {user?.rol === "usuario" && reserva.length > 0 && (
            <Paper
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 3,
                backgroundColor: "#e3f2fd",
                boxShadow: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                🛒 Carrito de Reserva
              </Typography>
              <Divider sx={{ my: 1 }} />
              {reserva.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography>
                    {item.nombre} — <b>{item.cantidad_reservada}</b>
                  </Typography>
                  <Box>
                    <IconButton onClick={() => cambiarCantidad(item.id, -1)}>
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                    <IconButton onClick={() => cambiarCantidad(item.id, 1)}>
                      <AddCircleOutlineIcon />
                    </IconButton>
                    <Button color="error" onClick={() => quitarDelCarrito(item.id)}>
                      Quitar
                    </Button>
                  </Box>
                </Box>
              ))}
              <Button
                variant="contained"
                color="primary"
                onClick={confirmarReserva}
                fullWidth
                sx={{ mt: 2 }}
              >
                Confirmar Reserva
              </Button>
            </Paper>
          )}

          {/* 🧩 Lista de materiales */}
          <Grid container spacing={3}>
            {materiales.length === 0 ? (
              <Grid item xs={12}>
                <Typography align="center" color="textSecondary">
                  No hay materiales disponibles.
                </Typography>
              </Grid>
            ) : (
              materiales
                .filter(
                  (material) =>
                    filtroCategoria === "Todos" ||
                    material.categoria === filtroCategoria
                )
                .map((material) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={material.id}>
                    <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                      <CardMedia
                        component="img"
                        height="180"
                        image={
                          material.imagen
                            ? `${API_URL}/uploads/${material.imagen}`
                            : "https://via.placeholder.com/200x150?text=Sin+Imagen"
                        }
                        alt={material.nombre}
                        sx={{
                          objectFit: "contain",
                          backgroundColor: "#fafafa",
                        }}
                      />
                      <CardContent>
                        <Typography variant="h6">{material.nombre}</Typography>
                        <Typography variant="body2">
                          Categoría: {material.categoria}
                        </Typography>
                        <Typography variant="body2">
                          Cantidad: {material.cantidad}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        {user?.rol === "admin" ? (
                          <>
                            <Button disabled>Editar</Button>
                            <Button color="error" disabled>
                              Eliminar
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => agregarReserva(material)}
                            disabled={material.cantidad <= 0}
                            variant="contained"
                          >
                            Reservar
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))
            )}
          </Grid>
        </Box>
      )}

      {/* =====================================================
          🧱 TAB 2: AGREGAR MATERIAL (solo informativo)
      ===================================================== */}
      {tabValue === 1 && user?.rol === "admin" && (
        <Paper sx={{ p: 3, backgroundColor: "#e3f2fd", borderRadius: 2 }}>
          <Typography sx={{ mb: 2 }}>
            ⚠ En esta versión no se pueden agregar materiales dinámicamente.
            <br />
            Se debe editar directamente el archivo{" "}
            <b>backend/database/sigmel.sql</b> y reiniciar el servidor.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
