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
  Alert,
} from "@mui/material";
import { BarChart, PieChart } from "@mui/x-charts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import AssessmentIcon from "@mui/icons-material/Assessment";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AutorenewIcon from "@mui/icons-material/Autorenew";

import uniLogo from "../assets/logo-unicaribe.png";

// 🌐 URL dinámica del backend (Render o local)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Reportes() {
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const reportRef = useRef();

  // ======================
  //  Generar Reporte (API)
  // ======================
  const generarReporte = async () => {
    if (!inicio || !fin) return alert("Selecciona un rango de fechas válido.");
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await axios.get(`${API_URL}/api/reportes`, {
        params: { inicio, fin },
      });
      if (!res.data || Object.keys(res.data).length === 0) {
        setErrorMsg("No hay datos disponibles para el rango seleccionado.");
        setReporte(null);
      } else {
        setReporte(res.data);
      }
    } catch (err) {
      console.error("❌ Error al generar reporte:", err);
      setErrorMsg("No se pudo conectar con el servidor. Intenta nuevamente.");
      setReporte(null);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  //  Exportar a PDF (multipágina)
  // ============================================================
  const descargarPDF = async () => {
    const input = reportRef.current;
    if (!input) return alert("No hay reporte para exportar.");

    const scale = 2;
    const canvas = await html2canvas(input, {
      scale,
      useCORS: true,
      windowWidth: document.documentElement.clientWidth,
      scrollY: -window.scrollY,
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const marginLeft = 10;
    const marginRight = 10;
    const marginBottom = 10;
    const headerTop = 12;
    const imgX = marginLeft;
    const imgW = pageWidth - marginLeft - marginRight;

    const drawHeader = () => {
      try {
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
      pdf.setDrawColor(25, 118, 210);
      pdf.line(10, headerTop + 28, pageWidth - 10, headerTop + 28);
    };

    const imgH_All = (canvas.height * imgW) / canvas.width;
    const pxPerMm = canvas.height / imgH_All;
    const usableFirstPageHeight = pageHeight - (headerTop + 30) - marginBottom;
    const usableNextPagesHeight = pageHeight - 2 * marginBottom;
    const sliceFirstPx = Math.floor(usableFirstPageHeight * pxPerMm);
    const sliceNextPx = Math.floor(usableNextPagesHeight * pxPerMm);
    let yPx = 0;
    let pageIndex = 0;

    while (yPx < canvas.height) {
      const sliceHeightPx =
        pageIndex === 0
          ? Math.min(sliceFirstPx, canvas.height - yPx)
          : Math.min(sliceNextPx, canvas.height - yPx);

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
      {/* Encabezado */}
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

      {/* Mensaje de error */}
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Contenido del Reporte */}
      {reporte && !errorMsg && (
        <>
          {/* … (aquí continúa igual todo el bloque de gráficos, tablas y PDF) … */}
        </>
      )}
    </Box>
  );
}
