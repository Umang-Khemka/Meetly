import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import useAuthStore from "../../store/authStore.js";

export default function Auth() {
  const { login, register, loading, user, fetchUser, isCheckingAuth } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  // Only fetch user on initial mount, not when user changes
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Redirect if already logged in - but only after we've checked auth status
  useEffect(() => {
    if (!isCheckingAuth && user) {
      navigate("/home");
    }
  }, [user, navigate, isCheckingAuth]);

  // Reset form fields when switching modes
  useEffect(() => {
    setUsername("");
    setEmail("");
    setPassword("");
    setMessage("");
  }, [isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (isLogin) {
      const res = await login(email, password);
      if (res.success) {
        setMessage("Login successful!");
        navigate("/home");
      } else {
        setMessage(res.message);
      }
    } else {
      const res = await register(username, email, password);
      if (res.success) {
        setMessage("Registration successful! Redirecting...");
        navigate("/home");
      } else {
        setMessage(res.message);
      }
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="auth-page">
        <div className="auth-form">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>{isLogin ? "Login" : "Register"}</h2>
        {message && <p>{message}</p>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label>Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p>
          {isLogin ? (
            <>
              Don&apos;t have an account?{" "}
              <span onClick={() => setIsLogin(false)}>Register</span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span onClick={() => setIsLogin(true)}>Login</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}