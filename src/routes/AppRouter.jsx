import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Login from '../pages/Login.jsx';
import Home from '../pages/Home.jsx';
import Admin from '../pages/Admin.jsx';
import CategoriesPage from '../pages/Categories.jsx';
import FavoritesPage from '../pages/Favorites.jsx';
import MyListPage from '../pages/List.jsx';
import ProfilePage from '../pages/Profile.jsx';

const PrivateRoute = ({ children, role }) => {
  const { user, logout } = useAuth();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (!user || !token) {
        setIsValid(false);
        setIsValidating(false);
        return;
      }

      try {
        await axios.get('http://localhost:3000/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsValid(true);
      } catch (err) {
        console.error('Token inválido:', err);
        logout();
        setIsValid(false);
      }
      setIsValidating(false);
    };

    validateToken();
  }, [user, logout]);

  if (isValidating) {
    return <div>Cargando...</div>;
  }

  if (!isValid) {
    console.log('No user o token inválido, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    console.log(`Rol no coincide: esperado ${role}, actual ${user.role}`);
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : user.role === 'admin' ? (
            <Navigate to="/admin" replace />
          ) : (
            <Navigate to="/home" replace />
          )
        }
      />
      <Route
        path="/home"
        element={
          <PrivateRoute role="user">
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <PrivateRoute role="user">
            <CategoriesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <PrivateRoute role="user">
            <FavoritesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/list"
        element={
          <PrivateRoute role="user">
            <MyListPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute role="user">
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute role="admin">
            <Admin />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}