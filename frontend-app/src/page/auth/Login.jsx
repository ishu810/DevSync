import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

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

        const role = res.data.user.role;
        if (role === "admin") navigate("/dashboard/admin");
        else if (role === "staff") navigate("/dashboard/staff");
        else navigate("/dashboard/citizen");
      } else {
        setError("Login failed. No token received.");
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">

      {/* GRID OVERLAY */}
      <div className="absolute inset-0 opacity-[0.18] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 38px)",
        }}
      ></div>

      {/* BACKGROUND IMAGE + DARK OVERLAY */}
      <div className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url("/src/assets/powerranger-bg.jpg")`,
        }}
      ></div>

      {/* BLUE GLOW */}
      <div className="absolute w-[350px] h-[350px] bg-blue-500 blur-[130px] opacity-25 top-[-80px] left-[-130px]"></div>

      {/* YELLOW GLOW */}
      <div className="absolute w-[400px] h-[400px] bg-yellow-400 blur-[150px] opacity-25 bottom-[-100px] right-[-150px]"></div>

      {/* LOGIN CARD */}
      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl px-10 py-10">

        {/* TITLE */}
        <h2
          className="text-3xl font-bold text-center mb-8 tracking-wide"
          style={{
            fontFamily: "Orbitron",
            background: "linear-gradient(to right, #f4d000, white)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* IDENTIFIER */}
          <div>
            <label className="block mb-1 text-white/80 font-semibold text-sm">
              Email or Username
            </label>
            <input
              type="text"
              name="identifier"
              placeholder="Enter email or username"
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 
              border border-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/40 
              outline-none transition"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block mb-1 text-white/80 font-semibold text-sm">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              onChange={handleChange}
              required
              minLength={6}
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 
              border border-white/30 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 
              outline-none transition"
            />
          </div>

          {/* ERROR MESSAGE */}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 
            font-semibold text-white shadow-lg shadow-blue-500/40 transition border border-transparent 
            hover:border-blue-400"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* REGISTER LINK */}
        <p className="text-center text-white/70 mt-6 text-sm">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-yellow-400 cursor-pointer font-semibold hover:underline"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}
