const express = require("express");
const router = express.Router();
const db = require("../db");

// 🧩 Función para limpiar comillas
const limpiar = (valor) => String(valor || "").replace(/"/g, "");

// 📊 Generar reporte (modo local sin MySQL)
router.get("/", (req, res) => {
  try {
    const { inicio, fin } = req.query;
    if (!inicio || !fin) {
      return res.status(400).json({ message: "Debes proporcionar un rango de fechas (inicio y fin)." });
    }

    const prestamos = db.prestamos || [];
    const materiales = db.materiales || [];
    const usuarios = db.usuarios || [];

    // 📅 Filtrar préstamos dentro del rango
    const enRango = prestamos.filter((p) => {
      const fecha = new Date(limpiar(p[4])).toISOString().split("T")[0];
      return fecha >= inicio && fecha <= fin;
    });

    // Totales
    const totalPrestamos = enRango.length;
    const totalDevoluciones = enRango.filter((p) => limpiar(p[5]) === "devuelto").length;
    const prestamosPendientes = enRango.filter((p) => limpiar(p[5]) !== "devuelto").length;

    // 📦 Material más prestado
    const conteoMateriales = {};
    enRango.forEach((p) => {
      const idMat = parseInt(p[2]);
      conteoMateriales[idMat] = (conteoMateriales[idMat] || 0) + 1;
    });
    const materialMasPrestadoId = Object.entries(conteoMateriales).sort((a, b) => b[1] - a[1])[0]?.[0];
    const materialMasPrestado =
      materiales.find((m) => parseInt(m[0]) === parseInt(materialMasPrestadoId))?.[1]?.replace(/"/g, "") || "N/A";

    // 👤 Usuario más activo
    const conteoUsuarios = {};
    enRango.forEach((p) => {
      const idUsr = parseInt(p[1]);
      conteoUsuarios[idUsr] = (conteoUsuarios[idUsr] || 0) + 1;
    });
    const usuarioMasActivoId = Object.entries(conteoUsuarios).sort((a, b) => b[1] - a[1])[0]?.[0];
    const usuarioMasActivo =
      usuarios.find((u) => parseInt(u[0]) === parseInt(usuarioMasActivoId))?.[2]?.replace(/"/g, "") || "N/A";

    // 🔄 Cálculo de rotación de materiales
    const rotacion = materiales.map((m) => {
      const idMat = parseInt(m[0]);
      const vecesPrestado = enRango.filter((p) => parseInt(p[2]) === idMat).length;
      const disponibles = parseInt(m[2]);
      const total = vecesPrestado + disponibles;
      const rot = total > 0 ? Math.round((vecesPrestado / total) * 100) : 0;
      return {
        material: limpiar(m[1]),
        disponibles,
        veces_prestado: vecesPrestado,
        rotacion: rot,
      };
    });

    // 📜 Historial por usuario (resumen)
    const historial = usuarios.map((u) => {
      const prestamosUsuario = enRango.filter((p) => parseInt(p[1]) === parseInt(u[0]));
      const prestamosTotales = prestamosUsuario.length;
      const devoluciones = prestamosUsuario.filter((p) => limpiar(p[5]) === "devuelto").length;
      const pendientes = prestamosTotales - devoluciones;

      return {
        usuario: limpiar(u[2]),
        prestamos: prestamosTotales,
        devoluciones,
        pendientes,
      };
    });

    // 📋 Observaciones automáticas
    const obs = [];
    const rotAlta = rotacion.filter((r) => r.rotacion > 75).length;
    if (prestamosPendientes > 0)
      obs.push(`Existen ${prestamosPendientes} préstamos pendientes de devolución.`);
    if (rotAlta > 0)
      obs.push(`${rotAlta} materiales presentan rotación alta (>75%).`);
    if (totalPrestamos === 0)
      obs.push("ℹ No se registraron préstamos en el rango seleccionado.");
    if (obs.length === 0)
      obs.push("El inventario general se encuentra en condiciones normales.");

    // 📤 Respuesta final
    res.json({
      rango: { inicio, fin },
      resumen: {
        totalPrestamos,
        totalDevoluciones,
        prestamosPendientes,
        materialMasPrestado,
        usuarioMasActivo,
      },
      rotacion,
      historial,
      observaciones: obs,
    });
  } catch (error) {
    console.error("❌ Error al generar reporte:", error);
    res.status(500).json({ message: "Error al generar reporte", error });
  }
});

module.exports = router;
