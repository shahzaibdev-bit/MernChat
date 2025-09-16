import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const BASE_URL = BACKEND_URL;
export const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
});
