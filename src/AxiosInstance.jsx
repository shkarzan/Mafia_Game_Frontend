import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  // baseURL: "http://localhost:8080", // Replace with your backend URL
  baseURL: "https://mafia-game-vj08.onrender.com",
  // baseURL: "/",
  headers: {
    "Content-Type": "application/json",
  },
});

// // Add a request interceptor
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("authToken"); // Retrieve token from local storage
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (token expired or not valid)
      window.location.href = "/";
    }
    if (error.response && error.response.status === 404) {
      toast.error("Game Not Found");
      window.location.href = "/join";
    }
    if (error.response && error.response.status == 500) {
      toast.error("Connection error");
    }
    return Promise.reject(error);
  }
);

export default api;
