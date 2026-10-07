import axios from "axios";
import { useAuthStore } from "../store/auth.store";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A session that's ended (for example, the password was reset on another
// device) gets a 401 even though a token was sent: sign out here so the
// app stops acting signed in. Protected pages then ask to log in again.
api.interceptors.response.use(undefined, (error) => {
  if (error?.response?.status === 401 && error.config?.headers?.Authorization) {
    useAuthStore.getState().logout();
  }
  return Promise.reject(error);
});

export default api;
