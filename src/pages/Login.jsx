import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Footer } from "../components/Footer";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 🔹 Aquí deberías llamar a tu API real (fetch/axios)
      // Ejemplo ficticio simulando login
      if (formData.email === "admin@geek.com" && formData.password === "1234") {
        login({ email: formData.email, role: "admin" });
        navigate("/admin");
      } else if (
        formData.email === "user@geek.com" &&
        formData.password === "1234"
      ) {
        login({ email: formData.email, role: "user" });
        navigate("/home");
      } else {
        setError("Credenciales incorrectas");
      }
    } catch (err) {
      setError("Error al iniciar sesión");
    }
  };
return (
  <div className="bg-black text-white">
    {/* Contenedor del formulario con fondo personalizado */}
    <div
      className="h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url('https://assets.nflxext.com/ffe/siteui/vlv3/3e4bd046-85a3-40e1-842d-fa11cec84349/web/CO-es-20250818-TRIFECTA-perspective_783420e1-1a07-4c2a-9f3c-585857c3ec6c_large.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800/90 p-8 rounded-lg shadow-lg w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block mb-1">Correo</label>
          <input
            type="email"
            name="email"
            onChange={handleChange}
            value={formData.email}
            required
            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring focus:ring-indigo-400"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Contraseña</label>
          <input
            type="password"
            name="password"
            onChange={handleChange}
            value={formData.password}
            required
            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring focus:ring-indigo-400"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 transition-colors py-2 rounded font-semibold"
        >
          Entrar
        </button>
      </form>
    </div>

    {/* Footer con fondo negro */}
    <Footer className="bg-black" />
  </div>
);

}
