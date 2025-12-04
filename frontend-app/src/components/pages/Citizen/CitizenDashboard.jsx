import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import ComplaintForm from "./ComplaintForm";
import ComplaintLifecycle from "./ComplaintLifecycle";
import { useNavigate } from "react-router-dom";

export default function CitizenDashboard() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const res = await axiosInstance.get("/api/dashboard/citizen");
        setUsername(res.data.msg.replace("Welcome citizen ", ""));
        setLoading(false);
      } catch {
        navigate("/login");
      }
    };
    verifyUser();
  }, [navigate]);

  if (loading)
    return (
      <p className="text-center text-green-400 mt-20 text-lg font-semibold">
        Checking authorization...
      </p>
    );

  return (
    <div className="flex min-h-screen text-white font-inter relative overflow-hidden">

      {/* 🌿 PURE GRADIENT BACKGROUND (NO IMAGE) */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-green-900/40 to-black"></div>

      {/* Texture grid overlay */}
      <div className="absolute inset-0 opacity-[0.08] bg-[url('./assets/grid.webp')] pointer-events-none"></div>

      {/* Neon green energy glows */}
      <div className="absolute w-[350px] h-[350px] bg-green-500 blur-[150px] opacity-25 top-[-120px] left-[-100px]"></div>
      <div className="absolute w-[300px] h-[300px] bg-green-300 blur-[140px] opacity-20 bottom-[-100px] right-[-80px]"></div>

      {/* SIDEBAR */}
      <aside className="w-64 mt-20 z-20 bg-black/40 backdrop-blur-xl border-r border-green-500/30 p-6">

        <h2 className="font-orbitron text-3xl text-green-400 tracking-wide mb-10">
          Dashboard
        </h2>

        <div className="space-y-4">

          <button
            className={`w-full px-4 py-2 text-left rounded-lg transition
              ${
                activeMenu === "dashboard"
                  ? "bg-green-500/30 border border-green-400 shadow-lg"
                  : "bg-white/10 hover:bg-white/20 border border-transparent"
              }`}
            onClick={() => setActiveMenu("dashboard")}
          >
            Dashboard
          </button>

          <button
            className={`w-full px-4 py-2 text-left rounded-lg transition
              ${
                activeMenu === "complaint-form"
                  ? "bg-green-500/30 border border-green-400 shadow-lg"
                  : "bg-white/10 hover:bg-white/20 border border-transparent"
              }`}
            onClick={() => setActiveMenu("complaint-form")}
          >
            Submit Complaint
          </button>

          <button
            className={`w-full px-4 py-2 text-left rounded-lg transition
              ${
                activeMenu === "lifecycle"
                  ? "bg-green-500/30 border border-green-400 shadow-lg"
                  : "bg-white/10 hover:bg-white/20 border border-transparent"
              }`}
            onClick={() => setActiveMenu("lifecycle")}
          >
            My Complaints
          </button>

        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 z-20">

        {activeMenu === "dashboard" && (
          <div className="bg-black/30 border border-green-500/30 rounded-xl shadow-xl backdrop-blur-xl p-6">
            <h2 className="font-orbitron text-2xl text-green-400">
              Welcome, {username}! ⚡
            </h2>
            <p className="text-green-100 mt-2">
              Use the sidebar to submit complaints or track your reports.
            </p>
          </div>
        )}

        {activeMenu === "complaint-form" && (
          <div className="bg-black/30 border border-green-500/30 rounded-xl shadow-xl backdrop-blur-xl p-6">
            <ComplaintForm />
          </div>
        )}

        {activeMenu === "lifecycle" && (
          <div className="bg-black/30 border border-green-500/30 rounded-xl shadow-xl backdrop-blur-xl p-6">
            <ComplaintLifecycle />
          </div>
        )}

      </main>

    </div>
  );
}
