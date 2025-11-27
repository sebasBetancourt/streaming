import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Listar comentarios de un título
export const getReviews = async (titleId) => {
  if (!titleId) throw new Error("Se requiere el ID del título para obtener los comentarios");
  try {
    const response = await axios.get(`${API_BASE}/reviews/list`, { params: { titleId } });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};

// Obtener ranking de un título
export const getRanking = async (titleId) => {
  if (!titleId) throw new Error("Se requiere el ID del título para obtener el ranking");
  try {
    const response = await axios.get(`${API_BASE}/reviews/ranking/${titleId}`);
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};

// Agregar un nuevo comentario
export const createReview = async (data) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No hay token de usuario");

    const response = await axios.post(`${API_BASE}/reviews/create`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};
