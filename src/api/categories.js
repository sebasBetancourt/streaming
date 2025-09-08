import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const getCategories = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE}/categories/list`, { params });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};

export const createCategories = async (data) => {
  try {
    const response = await axios.post(`${API_BASE}/titles/create`, data);
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};
