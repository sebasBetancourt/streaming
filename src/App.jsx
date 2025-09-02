// src/App.jsx
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppRouter from './routes/AppRouter.jsx';

function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('token');
      console.log('Validando sesión con token:', token); // Para depuración
      if (!user || !token) {
        console.log('No hay usuario o token, cerrando sesión');
        logout();
        navigate('/login', { replace: true });
        return;
      }

      try {
        const response = await axios.get('http://localhost:3000/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Respuesta de /auth/verify:', response.data);
      } catch (err) {
        console.error('Sesión inválida:', err);
        logout();
        navigate('/login', { replace: true });
      }
    };

    validateSession();
  }, [user, logout, navigate]);

  return <AppRouter />;
}

export default App;