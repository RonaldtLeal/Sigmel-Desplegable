// src/pages/Reportes.jsx
import { useState, useRef } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { BarChart, PieChart } from "@mui/x-charts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import AssessmentIcon from "@mui/icons-material/Assessment";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AutorenewIcon from "@mui/icons-material/Autorenew";

import uniLogo from "../assets/logo-unicaribe.png"; // <<--- Logo

export default function Reportes() {
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(false);
  const reportRef = useRef();

  // ======================
  //  Generar Reporte (API)
  // ======================
  const generarReporte = async () => {
    if (!inicio || !fin) return alert("Selecciona un rango de fechas válido.");
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:4000/api/reportes", {
        params: { inicio, fin },
      });
      setReporte(res.data);
    } catch (err) {
      console.error("❌ Error al generar reporte:", err);
      alert("Error al generar el reporte.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  //  Exportar a PDF (multipágina) — sin recortar nada del reporte
  // ============================================================
  const descargarPDF = async () => {
    const input = reportRef.current;
    if (!input) return alert("No hay reporte para exportar.");

    // Render del contenedor a un canvas grande
    const scale = 2; // nitidez
    const canvas = await html2canvas(input, {
      scale,
      useCORS: true,
      windowWidth: document.documentElement.clientWidth,
      scrollY: -window.scrollY,
    });

    // Config PDF
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const marginLeft = 10;
    const marginRight = 10;
    const marginBottom = 10;
    const headerTop = 12; // encabezado en página 1
    const imgX = marginLeft;
    const imgW = pageWidth - marginLeft - marginRight;

    // Dibujar encabezado textual (solo página 1)
    const drawHeader = () => {
      try {
        // logo a la izquierda
        pdf.addImage(uniLogo, "PNG", 10, 6, 24, 12);
      } catch {}
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(25, 118, 210);
      pdf.setFontSize(18);
      pdf.text("Universidad del Caribe", 37, headerTop + 4);

      pdf.setFontSize(12);
      pdf.text("SIGMEL - Sistema de Administración de Materiales", 37, headerTop + 10);

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(13);
      pdf.text("Reporte de Préstamos y Devoluciones", 10, headerTop + 20);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      const rango = `Rango: ${inicio} — ${fin}`;
      pdf.text(rango, 10, headerTop + 26);

      // línea separadora
      pdf.setDrawColor(25, 118, 210);
      pdf.line(10, headerTop + 28, pageWidth - 10, headerTop + 28);
    };

    // calcular alturas y trocear canvas a páginas A4
    // alto de la imagen (en mm) si la ajustamos al ancho imgW
    const imgH_All = (canvas.height * imgW) / canvas.width; // mm totales
    // cuántos píxeles hay por mm en este render
    const pxPerMm = canvas.height / imgH_All;

    // altura útil en la página 1 (dejamos espacio al encabezado)
    const usableFirstPageHeight = pageHeight - (headerTop + 30) - marginBottom;
    const usableNextPagesHeight = pageHeight - 2 * marginBottom;

    // altura útil en píxeles a recortar por página
    const sliceFirstPx = Math.floor(usableFirstPageHeight * pxPerMm);
    const sliceNextPx = Math.floor(usableNextPagesHeight * pxPerMm);

    let yPx = 0; // punto inicial del corte (en píxeles del canvas)
    let pageIndex = 0;

    while (yPx < canvas.height) {
      const sliceHeightPx =
        pageIndex === 0
          ? Math.min(sliceFirstPx, canvas.height - yPx)
          : Math.min(sliceNextPx, canvas.height - yPx);

      // crear un canvas parcial para esta página
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeightPx;
      const ctx = pageCanvas.getContext("2d");
      ctx.drawImage(
        canvas,
        0,
        yPx,
        canvas.width,
        sliceHeightPx,
        0,
        0,
        canvas.width,
        sliceHeightPx
      );
      const pageData = pageCanvas.toDataURL("image/png");

      if (pageIndex === 0) {
        drawHeader();
        const sliceHeightMm = sliceHeightPx / pxPerMm;
        pdf.addImage(pageData, "PNG", imgX, headerTop + 32, imgW, sliceHeightMm);
      } else {
        pdf.addPage();
        const sliceHeightMm = sliceHeightPx / pxPerMm;
        pdf.addImage(pageData, "PNG", imgX, marginBottom, imgW, sliceHeightMm);
      }

      yPx += sliceHeightPx;
      pageIndex++;
    }

    pdf.save(`Reporte_SIGMEL_${new Date().toLocaleDateString("es-MX")}.pdf`);
  };

  const promedioRotacion =
    reporte?.rotacion?.length
      ? (
          reporte.rotacion.reduce((acc, m) => acc + Number(m.rotacion || 0), 0) /
          reporte.rotacion.length
        ).toFixed(2)
      : "0.00";

  const colores = ["#1976d2", "#fbc02d", "#e53935", "#29b6f6", "#43a047"];

  return (
    <Box sx={{ p: 4, backgroundColor: "#f4f6fb", minHeight: "100vh" }}>
      {/* Encabezado visual en pantalla */}
      <Paper
        elevation={3}
        sx={{
          mb: 4,
          p: 2,
          borderRadius: 2,
          background: "linear-gradient(90deg,#1976d2 0%,#2196f3 100%)",
          color: "#fff",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            component="img"
            src={uniLogo}
            alt="Universidad del Caribe"
            sx={{ width: 70, height: "auto", borderRadius: 1, bgcolor: "#fff", p: 1 }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Universidad del Caribe
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.95 }}>
              SIGMEL - Sistema de Administración de Materiales
            </Typography>
          </Box>

          <AssessmentIcon sx={{ fontSize: 46, opacity: 0.9 }} />
        </Box>

        {inicio && fin && (
          <Typography sx={{ mt: 1.5, fontWeight: 600 }}>
            Reporte de Préstamos y Devoluciones ·{" "}
            <span style={{ fontWeight: 800 }}>
              Rango: {inicio} — {fin}
            </span>
          </Typography>
        )}
      </Paper>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: "#1565c0", fontWeight: "bold" }}>
          📅 Seleccionar rango de fechas
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              label="Fecha inicio"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              label="Fecha fin"
              value={fin}
              onChange={(e) => setFin(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={generarReporte}
              fullWidth
              sx={{
                height: "100%",
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#0d47a1" },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Generar Reporte"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Contenido del Reporte */}
      {reporte && (
        <>
          <Box ref={reportRef}>
            {/* KPIs */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                {
                  label: "Total Préstamos",
                  value: reporte.resumen.totalPrestamos,
                  color: "#1976d2",
                  icon: <AssignmentTurnedInIcon />,
                },
                {
                  label: "Devoluciones",
                  value: reporte.resumen.totalDevoluciones,
                  color: "#2e7d32",
                  icon: <CheckCircleIcon />,
                },
                {
                  label: "Pendientes",
                  value: reporte.resumen.prestamosPendientes,
                  color: "#f57c00",
                  icon: <WarningAmberIcon />,
                },
                {
                  label: "Rotación Promedio (%)",
                  value: promedioRotacion,
                  color: "#8e24aa",
                  icon: <AutorenewIcon />,
                },
              ].map((item, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Card
                    sx={{
                      textAlign: "center",
                      p: 2,
                      borderTop: `4px solid ${item.color}`,
                      boxShadow: 3,
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          color: item.color,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        {item.icon} {item.label}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: "bold", color: item.color }}>
                        {item.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Rotación + Estado del Inventario (centradas) */}
            <Grid
              container
              spacing={3}
              sx={{ mb: 4 }}
              justifyContent="center"
              alignItems="stretch"
            >
              {/* Barras */}
              <Grid item xs={12} md={10} lg={8}>
                <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{ color: "#1565c0", fontWeight: "bold", mb: 2 }}
                  >
                    📊 Rotación de Materiales
                  </Typography>

                  <Box sx={{ height: 340 }}>
                    <BarChart
                      height={340}
                      xAxis={[
                        {
                          scaleType: "band",
                          data: reporte.rotacion.map((r) => r.material),
                          tickLabelStyle: { fontSize: 12 },
                        },
                      ]}
                      series={[
                        {
                          data: reporte.rotacion.map((r) => Number(r.rotacion || 0)),
                          label: "Rotación (%)",
                          valueFormatter: (v) => `${v}%`,
                        },
                      ]}
                      margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
                      grid={{ horizontal: true }}
                      colors={["#1976d2"]}
                    />
                  </Box>

                  {/* Leyenda inferior personalizada y centrada */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 3,
                      mt: 1.5,
                    }}
                  >
                    {reporte.rotacion.map((r, i) => (
                      <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: colores[i % colores.length],
                          }}
                        />
                        <Typography variant="body2">
                          {r.material} ({r.rotacion}%)
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>

              {/* Dona */}
              <Grid item xs={12} md={10} lg={8}>
                <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{ color: "#1565c0", fontWeight: "bold", mb: 2 }}
                  >
                    🧩 Estado del Inventario
                  </Typography>
                  <PieChart
                    height={360}
                    series={[
                      {
                        data: reporte.rotacion.map((r, i) => ({
                          id: i,
                          value: Number(r.disponibles || 0),
                          label: `${r.material} (${r.disponibles})`,
                        })),
                        innerRadius: 60,
                        outerRadius: 120,
                        highlightScope: { faded: "global", highlighted: "item" },
                        faded: { innerRadius: 60, additionalRadius: -20, color: "gray" },
                      },
                    ]}
                    margin={{ right: 170 }}
                    slotProps={{
                      legend: {
                        direction: "column",
                        position: { vertical: "middle", horizontal: "right" },
                        itemMarkWidth: 14,
                        itemMarkHeight: 14,
                        labelStyle: { fontSize: 14 },
                      },
                    }}
                  />
                </Paper>
              </Grid>
            </Grid>

            {/* Tabla materiales */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: 2 }}>
              <Typography variant="h6" sx={{ color: "#1565c0", fontWeight: "bold" }}>
                🧱 Disponibilidad y rotación de materiales
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#1565c0" }}>
                    <TableCell sx={{ color: "white" }}>Material</TableCell>
                    <TableCell sx={{ color: "white" }}>Disponibles</TableCell>
                    <TableCell sx={{ color: "white" }}>Veces prestado</TableCell>
                    <TableCell sx={{ color: "white" }}>Rotación (%)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reporte.rotacion.map((m, i) => (
                    <TableRow key={i} sx={{ backgroundColor: i % 2 === 0 ? "#f9f9f9" : "white" }}>
                      <TableCell>{m.material}</TableCell>
                      <TableCell>{m.disponibles}</TableCell>
                      <TableCell>{m.veces_prestado}</TableCell>
                      <TableCell>{m.rotacion}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            {/* Historial por usuario */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: 2 }}>
              <Typography variant="h6" sx={{ color: "#1565c0", fontWeight: "bold" }}>
                👤 Historial por usuario
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#1565c0" }}>
                    <TableCell sx={{ color: "white" }}>Usuario</TableCell>
                    <TableCell sx={{ color: "white" }}>Préstamos</TableCell>
                    <TableCell sx={{ color: "white" }}>Devoluciones</TableCell>
                    <TableCell sx={{ color: "white" }}>Pendientes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reporte.historial.map((u, i) => (
                    <TableRow key={i} sx={{ backgroundColor: i % 2 === 0 ? "#f9f9f9" : "white" }}>
                      <TableCell>{u.usuario}</TableCell>
                      <TableCell>{u.prestamos}</TableCell>
                      <TableCell>{u.devoluciones}</TableCell>
                      <TableCell>{u.pendientes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            {/* Observaciones */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: 2 }}>
              <Typography variant="h6" sx={{ color: "#1565c0", fontWeight: "bold" }}>
                💬 Observaciones automáticas del sistema
              </Typography>
              <Divider sx={{ my: 1 }} />
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {reporte.observaciones.map((obs, i) => (
                  <li key={i}>
                    <Typography variant="body1" sx={{ mb: 0.5 }}>
                      {obs}
                    </Typography>
                  </li>
                ))}
              </ul>
            </Paper>
          </Box>

          {/* Botón PDF */}
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={descargarPDF}
              sx={{
                px: 4,
                py: 1.2,
                fontWeight: "bold",
                boxShadow: 2,
                "&:hover": { backgroundColor: "#2e7d32" },
              }}
            >
              📥 Descargar PDF
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
