import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

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
      }

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">

      
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url("/src/assets/powerranger-bg.jpg")`,
        }}
      />

      
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 38px)",
        }}
      ></div>


      <div className="absolute w-[350px] h-[350px] bg-blue-500 blur-[150px] opacity-25 top-[-90px] left-[-120px]"></div>

  
      <div className="absolute w-[380px] h-[380px] bg-yellow-400 blur-[170px] opacity-25 bottom-[-110px] right-[-120px]"></div>

     
      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-10 py-10 shadow-2xl">

     
        <h2
          className="text-3xl font-bold text-center mb-8"
          style={{
            fontFamily: "Orbitron",
            background: "linear-gradient(to right, #f4d000, white)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          ✨ Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

        
          <div>
            <label className="block mb-1 text-white/75 font-semibold text-sm">
              Username
            </label>
            <input
              type="text"
              name="username"
              placeholder="Enter username"
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 
              text-white placeholder-white/60 focus:border-blue-400 focus:ring-2 
              focus:ring-blue-500/40 outline-none transition"
            />
          </div>

        
          <div>
            <label className="block mb-1 text-white/75 font-semibold text-sm">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 
              text-white placeholder-white/60 focus:border-blue-400 focus:ring-2 
              focus:ring-blue-500/40 outline-none transition"
            />
          </div>


          <div>
            <label className="block mb-1 text-white/75 font-semibold text-sm">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              onChange={handleChange}
              required
              minLength={6}
              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 
              text-white placeholder-white/60 focus:border-blue-400 focus:ring-2 
              focus:ring-blue-500/40 outline-none transition"
            />
          </div>

          <div>
            <label className="block mb-1 text-white/75 font-semibold text-sm">
              Select Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 
              text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/40 
              outline-none transition"
            >
              <option value="citizen" className="text-black">Citizen</option>
              <option value="staff" className="text-black">Staff</option>
              <option value="admin" className="text-black">Admin</option>
            </select>
          </div>

      
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 transition 
            rounded-lg text-white font-semibold shadow-lg shadow-blue-500/40 
            border border-transparent hover:border-blue-400"
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>


        <p className="text-center text-white/70 mt-6 text-sm">
          Already have an account?{" "}
          <span
            className="text-yellow-400 cursor-pointer font-semibold hover:underline"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
