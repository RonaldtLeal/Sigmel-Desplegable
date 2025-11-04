const express = require("express");
const router = express.Router();
const db = require("../db"); // Base de datos cargada desde sigmel.sql

// =======================================================
// 📦 CREAR RESERVA (Modo local con sigmel.sql)
// =======================================================
router.post("/reservar", (req, res) => {
  const { usuario_id, material_id, cantidad } = req.body;
  console.log("📥 Reserva recibida:", { usuario_id, material_id, cantidad });

  // Validar datos
  if (!usuario_id || !material_id || !cantidad) {
    console.warn("⚠️ Datos incompletos en la reserva");
    return res.status(400).json({ message: "Faltan datos en la reserva" });
  }

  // Buscar material
  const material = db.materiales.find(
    (m) => Number(m[0]) === Number(material_id)
  );

  if (!material) {
    console.warn("❌ Material no encontrado:", material_id);
    return res.status(404).json({ message: "Material no encontrado" });
  }

  const stock = Number(material[2]);
  if (stock < cantidad) {
    console.warn("⚠️ Stock insuficiente. Disponible:", stock);
    return res
      .status(400)
      .json({ message: "No hay suficiente stock disponible" });
  }

  // Actualizar stock localmente
  const nuevoStock = stock - cantidad;
  const nuevoEstado = nuevoStock > 0 ? "disponible" : "agotado";
  material[2] = nuevoStock;
  material[4] = nuevoEstado;

  // Crear nuevo préstamo local
  const nuevoPrestamo = [
    Date.now(), // ID temporal
    usuario_id,
    material_id,
    cantidad,
    new Date().toISOString(),
    "reservado",
  ];
  db.prestamos.push(nuevoPrestamo);

  console.log(
    `✅ Reserva creada correctamente. Nuevo stock del material ${material_id}: ${nuevoStock}`
  );

  return res.json({
    message: "✅ Reserva registrada correctamente",
    id: nuevoPrestamo[0],
    nuevo_stock: nuevoStock,
  });
});

// =======================================================
// 🔄 CAMBIAR ESTADO DEL PRÉSTAMO
// =======================================================
router.put("/cambiarEstado/:id", (req, res) => {
  const { estado } = req.body;
  const { id } = req.params;

  console.log(`🔄 Cambio de estado solicitado: préstamo ${id} → ${estado}`);

  const prestamo = db.prestamos.find((p) => String(p[0]) === String(id));
  if (!prestamo) {
    console.warn("❌ Préstamo no encontrado:", id);
    return res.status(404).json({ message: "Préstamo no encontrado" });
  }

  prestamo[5] = estado;

  // Si es devolución, reponer el stock
  if (estado === "devuelto") {
    const material = db.materiales.find(
      (m) => Number(m[0]) === Number(prestamo[2])
    );
    if (material) {
      material[2] = Number(material[2]) + Number(prestamo[3]);
      material[4] = "disponible";
      console.log(
        `🔁 Stock restablecido para material ${material[0]}: ${material[2]} unidades`
      );
    }
  }

  console.log(`✅ Estado del préstamo ${id} actualizado a: ${estado}`);
  return res.json({ message: `Estado cambiado a ${estado}` });
});

// =======================================================
// 👤 OBTENER PRÉSTAMOS DE UN USUARIO
// =======================================================
router.get("/usuario/:id", (req, res) => {
  const { id } = req.params;
  const prestamosUsuario = db.prestamos
    .filter((p) => String(p[1]) === String(id))
    .map((p) => {
      const material = db.materiales.find(
        (m) => String(m[0]) === String(p[2])
      );
      return {
        id: p[0],
        material: material ? material[1] : "Desconocido",
        imagen: material ? material[3] : null,
        cantidad: p[3],
        fecha_prestamo: p[4],
        estado: p[5],
      };
    });

  console.log(`📤 ${prestamosUsuario.length} préstamos enviados para usuario ${id}`);
  return res.json(prestamosUsuario);
});

// =======================================================
// 🧾 OBTENER TODOS LOS PRÉSTAMOS (ADMIN)
// =======================================================
router.get("/", (req, res) => {
  const prestamos = db.prestamos.map((p) => {
    const usuario = db.usuarios.find((u) => String(u[0]) === String(p[1]));
    const material = db.materiales.find((m) => String(m[0]) === String(p[2]));
    return {
      id: p[0],
      usuario: usuario ? usuario[2] : "Desconocido",
      material: material ? material[1] : "Desconocido",
      cantidad: p[3],
      fecha_prestamo: p[4],
      estado: p[5],
    };
  });

  console.log(`📤 ${prestamos.length} préstamos enviados al cliente (modo local)`);
  return res.json(prestamos);
});

module.exports = router;
