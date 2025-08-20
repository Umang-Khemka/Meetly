import { create } from "zustand";
import axios from "./axiosInstance.js";

const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  isCheckingAuth: true, // NEW: Track if we're checking authentication status

  // Fetch current user (runs like your old useEffect)
  fetchUser: async () => {
    set({ isCheckingAuth: true });
    try {
      const { data } = await axios.get("/current");
      if (data.user === null) {
        set({ user: null, isCheckingAuth: false });
      } else {
        set({ user: data, isCheckingAuth: false });
      }
    } catch (error) {
      set({ user: null, isCheckingAuth: false });
    }
  },

  // LOGIN
  login: async (email, password) => {
    set({ loading: true });
    try {
      console.log("🔄 Attempting login for:", email); // Debug log
      const loginResponse = await axios.post("/login", { email, password });
      console.log("✅ Login successful"); // Debug log
      
      // Fetch user data after successful login
      const { data } = await axios.get("/current");
      set({ user: data });
      
      return { success: true };
    } catch (err) {
      console.log("❌ Login failed:", err.response?.status, err.response?.data?.message); // Debug log
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    } finally {
      set({ loading: false });
    }
  },

  // REGISTER
  register: async (username, email, password) => {
    set({ loading: true });
    try {
      console.log("🔄 Attempting registration for:", email); // Debug log
      await axios.post("/register", { username, email, password });
      console.log("✅ Registration successful"); // Debug log
      
      // Auto-login after registration by fetching current user
      const { data } = await axios.get("/current");
      set({ user: data });
      
      return { success: true };
    } catch (err) {
      console.log("❌ Registration failed:", err.response?.status, err.response?.data?.message); // Debug log
      return {
        success: false,
        message:
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Registration failed",
      };
    } finally {
      set({ loading: false });
    }
  },

  // LOGOUT
  logout: async () => {
    try {
      // Clear user state IMMEDIATELY before API call
      set({ user: null, isCheckingAuth: false });
      await axios.post("/logout");
      console.log("✅ Logout successful");
      return { success: true };
    } catch (err) {
      console.log("❌ Logout failed:", err.response?.data?.message);
      // Still keep user as null even if API fails
      set({ user: null, isCheckingAuth: false });
      return { success: false, message: "Logout failed" };
    }
  },
}));

export default useAuthStore;