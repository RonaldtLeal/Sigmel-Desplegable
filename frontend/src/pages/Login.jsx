import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logoUnicaribe from "../assets/logo-unicaribe.png";
import "../index.css";

// 🌐 URL dinámica del backend (Render o local)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Login({ setUser }) {
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/login`, { matricula, password });

      const user = res.data;
      if (!user || !user.rol) {
        setError("Error: datos de usuario inválidos.");
        return;
      }

      // 🧠 Guardar sesión localmente
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      // 🔀 Redirección según el rol
      if (user.rol === "admin") navigate("/admin");
      else if (user.rol === "usuario") navigate("/usuario");
      else setError("Rol de usuario desconocido.");
    } catch (err) {
      console.error("❌ Error al iniciar sesión:", err.response?.data || err.message);

      if (err.response?.status === 400) setError("Faltan datos de inicio de sesión.");
      else if (err.response?.status === 401)
        setError("Matrícula o contraseña incorrecta.");
      else setError("Error al conectar con el servidor SIGMEL.");

      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <img src={logoUnicaribe} alt="Unicaribe Logo" />
      <h1>SIGMEL</h1>
      <p>Sistema de Gestión de Materiales del Laboratorio de Electrónica</p>

      <form onSubmit={handleLogin}>
        <label htmlFor="matricula">Matrícula</label>
        <input
          type="text"
          id="matricula"
          placeholder="Ej. 210300123"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          required
          disabled={loading}
        />

        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Verificando..." : "Entrar"}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
