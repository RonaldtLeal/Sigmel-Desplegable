const express = require("express");
const router = express.Router();
const db = require("../db");

// 🧮 Función auxiliar para limpiar comillas de los datos del archivo SQL
const limpiar = (valor) => String(valor || "").replace(/"/g, "");

// 📊 Ruta principal del dashboard
router.get("/", (req, res) => {
  try {
    const materiales = db.materiales || [];
    const prestamos = db.prestamos || [];
    const usuarios = db.usuarios || [];

    // Totales principales
    const inventario = materiales.length;
    const prestamosActivos = prestamos.filter((p) =>
      ["reservado", "prestado"].includes(limpiar(p[5]))
    ).length;
    const totalUsuarios = usuarios.length;
    const stockBajo = materiales.filter((m) => parseInt(m[2]) < 5).length;

    // Prestamos y devoluciones del día actual
    const hoy = new Date().toISOString().slice(0, 10);
    const prestamosHoy = prestamos.filter((p) => limpiar(p[4]).startsWith(hoy)).length;
    const devolucionesHoy = prestamos.filter(
      (p) => limpiar(p[5]) === "devuelto" && limpiar(p[4]).startsWith(hoy)
    ).length;

    res.json({
      inventario,
      prestamos: prestamosActivos,
      usuarios: totalUsuarios,
      stock_bajo: stockBajo,
      prestamos_hoy: prestamosHoy,
      devoluciones_hoy: devolucionesHoy,
    });
  } catch (error) {
    console.error("❌ Error al obtener datos del dashboard:", error);
    res.status(500).json({ message: "Error al obtener datos del dashboard", error });
  }
});

// 🧾 Últimos préstamos
router.get("/ultimos", (req, res) => {
  try {
    const prestamos = db.prestamos || [];
    const usuarios = db.usuarios || [];
    const materiales = db.materiales || [];

    // Ordenamos por fecha descendente
    const ultimos = [...prestamos]
      .sort((a, b) => new Date(b[4]) - new Date(a[4]))
      .slice(0, 5)
      .map((p) => {
        const usuario = usuarios.find((u) => parseInt(u[0]) === parseInt(p[1]));
        const material = materiales.find((m) => parseInt(m[0]) === parseInt(p[2]));
        return {
          usuario: usuario ? limpiar(usuario[2]) : "Desconocido",
          material: material ? limpiar(material[1]) : "Desconocido",
          fecha_prestamo: limpiar(p[4]),
          estado: limpiar(p[5]),
        };
      });

    res.json(ultimos);
  } catch (error) {
    console.error("❌ Error al obtener últimos préstamos:", error);
    res.status(500).json({ message: "Error al obtener últimos préstamos", error });
  }
});

// 🏆 Materiales más prestados
router.get("/top", (req, res) => {
  try {
    const prestamos = db.prestamos || [];
    const materiales = db.materiales || [];

    const conteo = {};

    prestamos.forEach((p) => {
      const materialId = parseInt(p[2]);
      conteo[materialId] = (conteo[materialId] || 0) + 1;
    });

    const top = Object.entries(conteo)
      .map(([id, cantidad]) => {
        const material = materiales.find((m) => parseInt(m[0]) === parseInt(id));
        return {
          material: material ? limpiar(material[1]) : "Desconocido",
          cantidad,
        };
      })
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    res.json(top);
  } catch (error) {
    console.error("❌ Error al obtener materiales más prestados:", error);
    res.status(500).json({ message: "Error al obtener materiales más prestados", error });
  }
});

// 🔻 Materiales con menor stock
router.get("/menor-stock", (req, res) => {
  try {
    const materiales = db.materiales || [];

    const menorStock = [...materiales]
      .sort((a, b) => parseInt(a[2]) - parseInt(b[2]))
      .slice(0, 5)
      .map((m) => ({
        nombre: limpiar(m[1]),
        cantidad: parseInt(m[2]),
      }));

    res.json(menorStock);
  } catch (error) {
    console.error("❌ Error al obtener materiales con menor stock:", error);
    res.status(500).json({ message: "Error al obtener materiales con menor stock", error });
  }
});

// 📆 Préstamos por día (últimos 30 días)
router.get("/por-dia", (req, res) => {
  try {
    const prestamos = db.prestamos || [];
    const conteoPorDia = {};

    prestamos.forEach((p) => {
      const fecha = limpiar(p[4]).split(" ")[0];
      conteoPorDia[fecha] = (conteoPorDia[fecha] || 0) + 1;
    });

    const dias = Object.entries(conteoPorDia)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-30)
      .map(([fecha, cantidad]) => ({ fecha, cantidad }));

    res.json(dias);
  } catch (error) {
    console.error("❌ Error al obtener préstamos por día:", error);
    res.status(500).json({ message: "Error al obtener préstamos por día", error });
  }
});

module.exports = router;
