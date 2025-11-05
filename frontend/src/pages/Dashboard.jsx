import { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Divider,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Button,
  CircularProgress,
} from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import AssignmentIcon from "@mui/icons-material/Assignment";
import WarningIcon from "@mui/icons-material/Warning";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

// 🌐 URL dinámica (Render o local)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Dashboard() {
  const [datos, setDatos] = useState({});
  const [ultimosPrestamos, setUltimosPrestamos] = useState([]);
  const [topMateriales, setTopMateriales] = useState([]);
  const [menorStock, setMenorStock] = useState([]);
  const [prestamosPorDia, setPrestamosPorDia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ["#1976d2", "#b71c1c", "#0288d1", "#8e24aa", "#2e7d32"];

  // 🔁 Cargar todos los datos del backend
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [res, ultimos, top, low, dia] = await Promise.all([
        axios.get(`${API_URL}/api/dashboard`),
        axios.get(`${API_URL}/api/dashboard/ultimos`),
        axios.get(`${API_URL}/api/dashboard/top`),
        axios.get(`${API_URL}/api/dashboard/menor-stock`),
        axios.get(`${API_URL}/api/dashboard/por-dia`),
      ]);

      setDatos(res.data || {});
      setUltimosPrestamos(ultimos.data || []);
      setTopMateriales(top.data || []);
      setMenorStock(low.data || []);
      setPrestamosPorDia(dia.data || []);
      setError(null);
    } catch (err) {
      console.error("❌ Error al cargar datos del dashboard:", err);
      setError("No se pudo obtener información del servidor SIGMEL.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // 📊 Preparar datos de inventario
  const inventarioData = [
    { name: "Disponibles", value: (datos.inventario || 0) - (datos.stock_bajo || 0) },
    { name: "Stock Bajo", value: datos.stock_bajo || 0 },
  ];

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
          backgroundColor: "#f4f6f8",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando estadísticas del laboratorio...
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
          backgroundColor: "#f4f6f8",
          textAlign: "center",
        }}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" color="primary" onClick={cargarDatos}>
          Reintentar conexión
        </Button>
      </Box>
    );
  }

  // ✅ Dashboard principal
  return (
    <Box
      sx={{
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
        p: 3,
        overflowX: "hidden",
        overflowY: "auto",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          fontWeight: "bold",
          color: "#0d47a1",
          textShadow: "0 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        Panel General
      </Typography>

      {/* KPIs */}
      <Grid
        container
        spacing={2}
        sx={{
          mb: 4,
          flexWrap: "nowrap",
          overflowX: "auto",
          overflowY: "visible",
          pb: 1,
          width: "100%",
        }}
      >
        <KPI icon={<InventoryIcon />} label="Materiales Totales" value={datos.inventario} color="#1565c0" />
        <KPI icon={<AssignmentIcon />} label="Préstamos Activos" value={datos.prestamos} color="#8e24aa" />
        <KPI icon={<WarningIcon />} label="Stock Bajo" value={datos.stock_bajo} color="#f57c00" />
        <KPI icon={<AssignmentIcon />} label="Préstamos del Día" value={datos.prestamos_hoy} color="#0288d1" />
        <KPI icon={<AssignmentIcon />} label="Devoluciones del Día" value={datos.devoluciones_hoy} color="#43a047" />
      </Grid>

      {/* Sección de gráficas principales */}
      <Grid container spacing={3}>
        <Grafico title="Materiales más prestados">
          <BarChart data={topMateriales}>
            <XAxis dataKey="material" tick={false} axisLine={false} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="cantidad" fill="#1565c0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </Grafico>

        <Grafico title="Estado del Inventario">
          <PieChart>
            <Pie
              data={inventarioData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
            >
              {inventarioData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </Grafico>

        {/* 📈 Gráfico de préstamos por día */}
        <Grafico title="Préstamos por Día (últimos 30 días)">
          <LineChart data={prestamosPorDia}>
            <XAxis
              dataKey="fecha"
              tickFormatter={(tick) =>
                new Date(tick).toLocaleDateString("es-MX", {
                  day: "2-digit",
                  month: "short",
                })
              }
            />
            <YAxis />
            <Tooltip
              labelFormatter={(label) =>
                new Date(label).toLocaleDateString("es-MX", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                })
              }
            />
            <Line
              type="monotone"
              dataKey="cantidad"
              stroke="#0d47a1"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </Grafico>

        {/* 🧩 Tablas complementarias */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={cardStyle}>
              <Typography variant="h6" sx={tituloGrafico}>
                Materiales con menor stock
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List dense sx={{ flex: 1, overflowY: "auto" }}>
                {menorStock.length > 0 ? (
                  menorStock.map((item, i) => (
                    <ListItem key={i}>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 600 }}>{item.nombre}</Typography>}
                        secondary={<Typography variant="body2">Cantidad: {item.cantidad}</Typography>}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No hay materiales con stock bajo.
                  </Typography>
                )}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={cardStyle}>
              <Typography variant="h6" sx={tituloGrafico}>
                Últimos Préstamos
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List dense sx={{ flex: 1, overflowY: "auto" }}>
                {ultimosPrestamos.length > 0 ? (
                  ultimosPrestamos.map((p, i) => (
                    <ListItem key={i}>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {p.material}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {p.usuario} –{" "}
                              {new Date(p.fecha_prestamo).toLocaleDateString("es-MX")}
                            </Typography>
                            <Chip
                              label={p.estado}
                              size="small"
                              sx={{
                                mt: 0.5,
                                bgcolor: p.estado === "devuelto" ? "#c8e6c9" : "#bbdefb",
                                color: p.estado === "devuelto" ? "#2e7d32" : "#1565c0",
                                fontWeight: "bold",
                              }}
                            />
                          </>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No hay préstamos recientes.
                  </Typography>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

/* 🔹 Componentes reutilizables */
const KPI = ({ icon, label, value, color }) => (
  <Grid item xs={12} sm={6} md={2.4}>
    <Paper
      sx={{
        p: 2.5,
        textAlign: "center",
        borderRadius: 3,
        boxShadow: 3,
        backgroundColor: "#fff",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": { transform: "translateY(-3px)", boxShadow: 6 },
      }}
    >
      <Box sx={{ color, fontSize: 35, mb: 1 }}>{icon}</Box>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: "bold", color }}>
        {value ?? 0}
      </Typography>
    </Paper>
  </Grid>
);

const Grafico = ({ title, children }) => (
  <Grid item xs={12} md={6}>
    <Paper sx={cardStyle}>
      <Typography variant="h6" sx={tituloGrafico}>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </Box>
    </Paper>
  </Grid>
);

/* 🔹 Estilos compartidos */
const cardStyle = {
  p: 2.5,
  borderRadius: 3,
  boxShadow: 3,
  height: 350,
  backgroundColor: "#fff",
  display: "flex",
  flexDirection: "column",
};

const tituloGrafico = {
  fontWeight: "bold",
  mb: 1,
  color: "#0d47a1",
};
