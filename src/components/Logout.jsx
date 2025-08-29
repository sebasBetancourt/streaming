// src/components/Logout.jsx
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Limpia el estado de autenticación
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true }); // replace: true evita agregar al historial
  };

  return (
    <button
      onClick={handleLogout}
      className="h-11 rounded-md bg-[#e50914] px-5 font-semibold transition hover:bg-[#f6121d]"
    >
      Cerrar Sesión
    </button>
  );
}