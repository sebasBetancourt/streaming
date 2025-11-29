import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthContext";
import PrivateRoute from "./PrivateRouter";

import Login from "@/features/auth/pages/Login";

import Home from "@/features/Clients/home/pages/Home";
import CategoriesPage from "@/features/Clients/categories/pages/Categories";
import FavoritesPage from "@/features/Clients/favorites/pages/Favorites";
import MyListPage from "@/features/Clients/list/pages/List";
import ProfilePage from "@/features/Clients/profile/pages/Profile";
import NetflixPlayer from "@/shared/components/NetflixPlayer";

import Admin from "@/features/Admin/pages/Admin";

import ClientLayout from "@/layouts/ClientLayout/ClientLayout";

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* REDIRECCIÓN INICIAL */}
      <Route
        path="/"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : user.role === "admin" ? (
            <Navigate to="/admin" replace />
          ) : (
            <Navigate to="/home" replace />
          )
        }
      />

      {/* CLIENT LAYOUT */}
      <Route element={<PrivateRoute role="user"><ClientLayout /></PrivateRoute>}>
        <Route path="/home" element={<Home />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/list" element={<MyListPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        
      </Route>

      

      {/* ADMIN LAYOUT */}
      <Route element={<PrivateRoute role="admin"></PrivateRoute>}>
        <Route path="/admin" element={<Admin />} />
      </Route>

      {/* NOT FOUND */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
