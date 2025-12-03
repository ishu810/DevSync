import React, { useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import "./Register.css"; // Import the new unified CSS

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "citizen",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      setError("⚠️ Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axiosInstance.post("/api/auth/register", formData);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        const role = res.data.user?.role;

        if (role === "admin") navigate("/dashboard/admin");
        else if (role === "staff") navigate("/dashboard/staff");
        else navigate("/dashboard/citizen");
      } else {
        setError("Registration successful, please log in.");
        navigate("/login");
      }
    } catch (err) {
      setError(
        err.response?.data?.msg || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Ambient Glows */}
      <div className="register-blue"></div>
      <div className="register-yellow"></div>

      {/* Register Card */}
      <div className="register-card">
        <h2 className="register-title">✨ Create Account</h2>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <label className="register-label">Username</label>
          <input
            type="text"
            name="username"
            className="register-input"
            placeholder="Enter username"
            onChange={handleChange}
            required
          />

          {/* Email */}
          <label className="register-label">Email</label>
          <input
            type="email"
            name="email"
            className="register-input"
            placeholder="Enter email"
            onChange={handleChange}
            required
          />

          {/* Password */}
          <label className="register-label">Password</label>
          <input
            type="password"
            name="password"
            className="register-input"
            placeholder="Enter password"
            onChange={handleChange}
            required
            minLength={6}
          />

          {/* Role */}
          <label className="register-label">Select Role</label>
          <select
            name="role"
            className="register-select"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="citizen">Citizen</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>

          {/* Error Message */}
          {error && <p className="login-error">{error}</p>}

          {/* Submit Button */}
          <button className="register-btn" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Navigation Link */}
        <p className="register-footer">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}
