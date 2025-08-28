
import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:8000/api/v1/users"
      : "/api/v1/users",
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
