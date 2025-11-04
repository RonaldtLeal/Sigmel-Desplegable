import { useState } from "react";

export default function NuevoMaterial() {
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [imagen, setImagen] = useState("");
  const [categoria, setCategoria] = useState("");
  const [mensaje, setMensaje] = useState("");

  const categorias = [
    "Instrumentos de medición",
    "Elementos pasivos",
    "Elementos activos",
    "Varios",
    "Herramientas",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🧩 Como no hay BD activa, solo mostramos mensaje informativo
    setMensaje(
      "⚠ Esta versión funciona en modo lectura. Para agregar materiales reales, edita el archivo backend/database/sigmel.sql y reinicia el servidor."
    );

    // Limpiar campos
    setNombre("");
    setCantidad("");
    setImagen("");
    setCategoria("");
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#f9f9f9",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ marginBottom: "1rem", color: "#0d47a1" }}>
        ➕ Agregar Nuevo Material (modo local)
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Nombre del material:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.6rem",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Cantidad disponible:</label>
          <input
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.6rem",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Categoría:</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.6rem",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          >
            <option value="">Seleccione una categoría</option>
            {categorias.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>URL de imagen (GitHub, etc.):</label>
          <input
            type="text"
            value={imagen}
            onChange={(e) => setImagen(e.target.value)}
            placeholder="https://..."
            style={{
              width: "100%",
              padding: "0.6rem",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "0.8rem 1rem",
            backgroundColor: "#1565c0",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Registrar
        </button>

        {mensaje && (
          <p
            style={{
              marginTop: "1rem",
              color: "#333",
              backgroundColor: "#e3f2fd",
              padding: "0.8rem",
              borderRadius: "8px",
              fontSize: "0.9rem",
            }}
          >
            {mensaje}
          </p>
        )}
      </form>
    </div>
  );
}
