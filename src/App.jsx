import { useEffect } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppRouter from "./routes/AppRouter.jsx";



function App() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const validateSession = async () => {
      try {
        axios.defaults.withCredentials = true;
        axios.defaults.baseURL = "http://localhost:3000";
        const response = await axios.get("http://localhost:3000/auth/verify");
        console.log("Respuesta de /auth/verify:", response.data);
        login(response.data.user); 
      } catch (err) {
        console.error("Sesión inválida:", err);
        logout();
        navigate("/login", { replace: true });
      }
    };

    validateSession();
  }, [logout, login, navigate]);

  return <AppRouter />;
}

export default App;
