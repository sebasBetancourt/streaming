import { Navigate, Route, Routes } from "react-router-dom";
import Login from "@/features/auth/pages/Login";
import Admin from "@/features/Admin/pages/Admin";
import CategoriesPage from "@/features/Clients/categories/pages/Categories";
import FavoritesPage from "@/features/Clients/favorites/pages/Favorites";
import Home from "@/features/Clients/home/pages/Home";
import MyListPage from "@/features/Clients/list/pages/List";
import ProfilePage from "@/features/Clients/profile/pages/Profile";
import ClientLayout from "@/layouts/ClientLayout/ClientLayout";
import { useAuth } from "../providers/AuthContext";
import PrivateRoute from "./PrivateRoute";

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={<Navigate to={!user ? "/login" : user.role === "admin" ? "/admin" : "/home"} replace />}
      />

      {/* Zona de cliente: la ven usuarios y admins */}
      <Route element={<PrivateRoute roles={["user", "admin"]} />}>
        <Route element={<ClientLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/list" element={<MyListPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Panel de administración */}
      <Route element={<PrivateRoute roles={["admin"]} />}>
        <Route path="/admin" element={<Admin />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
