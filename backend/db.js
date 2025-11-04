const fs = require("fs");
const path = require("path");

// 📁 Ruta al archivo de base de datos local
const sqlPath = path.resolve(__dirname, "../database/sigmel.sql");

// 📖 Leer el contenido del archivo SQL
let sqlContent = "";
try {
  sqlContent = fs.readFileSync(sqlPath, "utf8");
  console.log("✅ Archivo sigmel.sql leído correctamente");
} catch (err) {
  console.error("❌ No se pudo leer el archivo sigmel.sql:", err.message);
}

// 🧩 Función que extrae los datos de una tabla SQL (convierte a arrays JS)
const extractData = (table) => {
  try {
    const regex = new RegExp(`INSERT INTO \`${table}\` .*?VALUES\\s*(.*?);`, "s");
    const match = sqlContent.match(regex);
    if (!match) {
      console.warn(`⚠️ No se encontraron datos para la tabla '${table}'`);
      return [];
    }

    const values = match[1]
      .replace(/\),\s*\(/g, ")|(")
      .split("|")
      .map((row) =>
        row
          .replace(/^\(|\)$/g, "")
          .split(",")
          .map((v) =>
            v
              .trim()
              .replace(/^'|'$/g, "") // quita comillas simples externas
              .replace(/^"|"$/g, "") // quita comillas dobles internas
          )
      );

    return values;
  } catch (err) {
    console.error(`❌ Error al procesar la tabla '${table}':`, err.message);
    return [];
  }
};

// 📦 Exportar los datos
const db = {
  materiales: extractData("materiales"),
  prestamos: extractData("prestamos"),
  usuarios: extractData("usuarios"),
};

// 🧾 Mostrar conteo
console.log(`👥 Usuarios cargados: ${db.usuarios.length}`);
console.log(`📦 Materiales cargados: ${db.materiales.length}`);
console.log(`📚 Préstamos cargados: ${db.prestamos.length}`);

// 🧠 Verificación opcional
console.log("🧩 Vista previa de usuarios:", db.usuarios.slice(0, 3));

module.exports = db;
