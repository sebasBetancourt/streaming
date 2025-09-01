import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get("http://localhost:3000/auth/verify", {
          withCredentials: true, 
        });
        setUser(res.data.user); 
      } catch (err) {
        console.error("No hay sesión activa", err);
        setUser(null);
      }
    };

    checkSession();
  }, []);

  // login solo guarda el usuario que el backend devuelve
  const login = async (credentials) => {
    const res = await axios.post("http://localhost:3000/auth/login", credentials, {
      withCredentials: true, 
    });
    setUser(res.data.user);
  };

  const logout = async () => {
    await axios.post("http://localhost:3000/auth/logout", {}, { withCredentials: true });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
