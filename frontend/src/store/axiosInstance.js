
import axios from "axios";
import server from "../environment.js";

const axiosInstance = axios.create({
  baseURL: `${server}/api/v1/users`,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
