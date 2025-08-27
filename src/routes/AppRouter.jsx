import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Admin from "../pages/Admin";
import CategoriesPage from "../pages/Categories";
import FavoritesPage from "../pages/Favorites";
import MyListPage from "../pages/List";
import ProfilePage from "../pages/Profile";

const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  // si se requiere rol específico
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
};

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Página inicial → login */}
        <Route path="/login" element={<Login />} />

        {/* Redirigir root "/" al login si no hay usuario */}
        <Route
          path="/"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.role === "admin" ? (
              <Navigate to="/admin" />
            ) : (
              <Navigate to="/home" />
            )
          }
        />

        {/* Usuario normal */}
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
        element={<CategoriesPage />} 
        />
        <Route 
        path="/favorites" 
        element={<FavoritesPage />} 
        />
        <Route 
        path="/list" 
        element={<MyListPage />} 
        />
        <Route 
        path="/profile" 
        element={<ProfilePage />} 
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <Admin />
            </PrivateRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
