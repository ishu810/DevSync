import React, { useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // new CSS file

export default function Login() {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await axiosInstance.post("/api/auth/login", formData);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        if (res.data.user.role === "admin") navigate("/dashboard/admin");
        else if (res.data.user.role === "staff") navigate("/dashboard/staff");
        else navigate("/dashboard/citizen");
      } else {
        setError("Login failed. No token received.");
      }
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="energy-blue"></div>
<div className="energy-yellow"></div>
      <div className="login-card">
        <h2 className="login-title">🌟 Welcome Back</h2>

        <form onSubmit={handleSubmit}>
          <label className="login-label">Email or Username</label>
          <input
            type="text"
            name="identifier"
            className="login-input"
            placeholder="Enter your email or username"
            onChange={handleChange}
            required
          />

          <label className="login-label">Password</label>
          <input
            type="password"
            name="password"
            className="login-input"
            placeholder="Enter your password"
            onChange={handleChange}
            required
            minLength={6}
          />

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="login-register">
          Don’t have an account?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
        </p>
      </div>
    </div>
  );
}
