const express = require("express");
const router = express.Router();
const db = require("../db"); // 📦 Datos cargados desde sigmel.sql

// 📥 Obtener todos los materiales
router.get("/materiales", (req, res) => {
  try {
    if (!db.materiales || db.materiales.length === 0) {
      return res.status(404).json({ error: "No hay materiales disponibles." });
    }

    // Convertir los datos del formato del .sql (array) a objetos legibles
    const materiales = db.materiales.map((m) => ({
      id: parseInt(m[0]),
      nombre: String(m[1]).replace(/"/g, ""),
      cantidad: parseInt(m[2]),
      imagen: String(m[3]).replace(/"/g, ""),
      estado: String(m[4]).replace(/"/g, ""),
      categoria: String(m[5]).replace(/"/g, ""),
    }));

    res.json(materiales);
  } catch (err) {
    console.error("❌ Error al obtener materiales:", err);
    res.status(500).json({ error: "Error al obtener materiales." });
  }
});

// 📤 Crear material nuevo (modo local)
router.post("/materiales", (req, res) => {
  try {
    const { nombre, cantidad, categoria } = req.body;

    if (!nombre || !cantidad || !categoria) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    // Crear ID incremental
    const nuevoId = db.materiales.length > 0 ? db.materiales.length + 1 : 1;

    // Crear nuevo material (imagen y estado son opcionales)
    const nuevoMaterial = [
      nuevoId,
      `"${nombre}"`,
      cantidad,
      `"placeholder.jpg"`,
      `"disponible"`,
      `"${categoria}"`,
    ];

    db.materiales.push(nuevoMaterial);

    console.log("✅ Nuevo material agregado:", nuevoMaterial);
    res.status(201).json({ mensaje: "Material agregado correctamente." });
  } catch (err) {
    console.error("❌ Error al crear material:", err);
    res.status(500).json({ error: "Error al crear material." });
  }
});

// 🗑️ Eliminar material (modo local)
router.delete("/materiales/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = db.materiales.findIndex((m) => parseInt(m[0]) === id);

    if (index === -1) {
      return res.status(404).json({ error: "Material no encontrado." });
    }

    db.materiales.splice(index, 1);
    console.log("🗑️ Material eliminado ID:", id);
    res.json({ mensaje: "Material eliminado correctamente." });
  } catch (err) {
    console.error("❌ Error al eliminar material:", err);
    res.status(500).json({ error: "Error al eliminar material." });
  }
});

module.exports = router;
