import axios from "axios";

const normalizeApiBase = (value) => {
  if (!value) return "";
  return String(value).trim().replace(/\/+$/, "");
};

const apiBaseFromEnv = normalizeApiBase(process.env.REACT_APP_API_URL);
const API_BASE_URL = apiBaseFromEnv || "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
});

export default API;
