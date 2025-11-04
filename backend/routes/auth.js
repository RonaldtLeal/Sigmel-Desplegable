const express = require("express");
const router = express.Router();
const db = require("../db"); // Datos cargados desde sigmel.sql

// 🧩 Middleware local para asegurar que se lea el JSON correctamente
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// 🧠 Ruta de login (lectura directa desde archivo SQL)
router.post("/login", (req, res) => {
  // 🧩 Logs de depuración para verificar qué llega realmente
  console.log("📦 Body recibido exactamente:", req.body);
  console.log("📦 Tipo de body:", typeof req.body);

  const { matricula, password } = req.body || {};

  // Validar campos vacíos o body inexistente
  if (!matricula || !password) {
    console.log("⚠️ Campos incompletos o body vacío.");
    return res.status(400).json({ error: "Matrícula y contraseña requeridas" });
  }

  const matriculaLimpia = String(matricula).trim();
  const passwordLimpia = String(password).trim();

  // 🧩 Mostrar vista previa de usuarios (para depuración)
  console.log(
    "🧩 Vista previa de usuarios cargados:",
    Array.isArray(db.usuarios)
      ? db.usuarios.slice(0, 3)
      : "⚠️ db.usuarios no es un array válido"
  );

  let usuario = null;

  // ✅ Buscar usuario por matrícula (según el tipo de datos en sigmel.sql)
  if (Array.isArray(db.usuarios) && db.usuarios.length > 0) {
    // Caso 1️⃣: estructura tipo objeto
    if (typeof db.usuarios[0] === "object" && !Array.isArray(db.usuarios[0])) {
      usuario = db.usuarios.find(
        (u) => String(u.matricula).trim() === matriculaLimpia
      );
    }
    // Caso 2️⃣: estructura tipo array [id, matricula, nombre, password, rol]
    else {
      const match = db.usuarios.find(
        (u) => String(u[1]).trim() === matriculaLimpia
      );
      if (match) {
        usuario = {
          id: match[0],
          matricula: match[1],
          nombre: match[2],
          password: match[3],
          rol: match[4],
        };
      }
    }
  }

  if (!usuario) {
    console.log("🔍 Matrícula no encontrada:", matriculaLimpia);
    return res.status(401).json({ error: "Matrícula o contraseña incorrecta" });
  }

  // 🔐 Comparar contraseñas
  if (passwordLimpia !== String(usuario.password).trim()) {
    console.log("❌ Contraseña incorrecta para:", matriculaLimpia);
    return res.status(401).json({ error: "Matrícula o contraseña incorrecta" });
  }

  // ✅ Login exitoso
  console.log("✅ Login exitoso:", usuario.matricula, "-", usuario.rol);
  res.json({
    id: usuario.id,
    nombre: usuario.nombre,
    matricula: usuario.matricula,
    rol: usuario.rol,
  });
});

module.exports = router;
