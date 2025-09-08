import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const createTitle = async (data) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No se proporcionó token, inicia sesión primero");

    const response = await axios.post(`${API_BASE}/titles/create`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};

export const getTitles = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE}/titles/list`, { params });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};

export const getTitlesList = async ({ skip = 0, limit = 30, type } = {}) => {
  try {
    const token = localStorage.getItem("token"); 
    if (!token) throw new Error("No hay token de usuario");

    const params = { skip, limit };
    if (type) params.type = type;

    const response = await axios.get(`${API_BASE}/titles/list/collection`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};