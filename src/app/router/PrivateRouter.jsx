import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function PrivateRoute({ children, role }) {
  const { user, logout } = useAuth();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");
      if (!user || !token) {
        setIsValid(false);
        setIsValidating(false);
        return;
      }

      try {
        await axios.get(`${API_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsValid(true);
      } catch (err) {
        logout();
        setIsValid(false);
      }

      setIsValidating(false);
    };

    validateToken();
  }, [user, logout]);

  if (isValidating) return <div>Cargando...</div>;

  if (!isValid) return <Navigate to="/login" replace />;

  if (role && user.role !== role)
    return <Navigate to="/home" replace />;

  return children;
}
