import React, { useState, useEffect } from "react";

import axiosInstance from "../../api/axiosInstance";
import ComplaintForm from "./ComplaintForm";
import ComplaintLifecycle from "./ComplaintLifecycle";
import StatCard from "../../components/StatCard";
import { useNavigate } from "react-router-dom";
export default function CitizenDashboard() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const res = await axiosInstance.get("/api/dashboard/citizen");
        setUsername(res.data.msg.replace("Welcome citizen ", ""));
            const statsRes = await axiosInstance.get("/api/users/dashboard/stats");
    setStats(statsRes.data);
        setLoading(false);
      } catch {
        navigate("/login");
      }
    };

    verifyUser();
  }, [navigate]);

  if (loading)
    return (
      <p className="text-center text-[#7CFFD8] mt-20 text-lg font-semibold">
        Checking authorization...
      </p>
    );

  return (
    <div className="flex min-h-screen text-white font-inter relative overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-br from-[#00160D] via-[#003A20] to-[#001008]" />

      <div className="absolute inset-0 opacity-[0.10] bg-[url('./assets/grid.webp')] bg-cover pointer-events-none"></div>

      <div className="absolute w-[380px] h-[380px] bg-[#3CFF8F] blur-[110px] opacity-15 top-[-140px] left-[-120px]" />
      <div className="absolute w-[320px] h-[320px] bg-[#B4FF5A] blur-[110px] opacity-10 bottom-[-100px] right-[-100px]" />

      {/* SIDEBAR */}
      <aside className="w-64 z-20 bg-[#00160D]/70 backdrop-blur-xl
        border-r border-[#3CFF8F]/30 p-6 rounded-r-2xl
        shadow-[0_0_18px_#3CFF8F]/30">
        
        <h2 className="font-orbitron text-3xl font-bold text-[#3CFF8F] tracking-wide mt-13  mb-10
          ">
          Dashboard
        </h2>

        <div className="space-y-5">

          {/* My Complaints */}
          <button
            className={`w-full px-5 py-3 text-left rounded-lg transition font-semibold tracking-wide
              ${
                activeMenu === "lifecycle"
                  ? "bg-[#3CFF8F]/20 border border-[#3CFF8F] shadow-[0_0_12px_#3CFF8F]/30"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            onClick={() => setActiveMenu("lifecycle")}
          >
            My Complaints
          </button>

          {/* Submit Complaint */}
          <button
            className={`w-full px-5 py-3 text-left rounded-lg transition font-semibold tracking-wide
              ${
                activeMenu === "complaint-form"
                  ? "bg-[#7CFFD8]/20 border border-[#7CFFD8] shadow-[0_0_12px_#7CFFD8]/30"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            onClick={() => setActiveMenu("complaint-form")}
          >
            Submit Complaint
          </button>

        </div>
      </aside>

      <main className="flex-1 p-10 z-20">

        {/* Submit Complaint Panel */}
        {activeMenu === "complaint-form" && (
          <div className="bg-[#00160D]/70 border border-[#7CFFD8]/25 rounded-xl
            shadow-[0_0_18px_#7CFFD8]/25 backdrop-blur-xl p-8">
            <ComplaintForm neon />
          </div>
        )}

        {activeMenu === "lifecycle" && (
          <div
  className="
    bg-white/10
    backdrop-blur-xl
    rounded-3xl
    border border-white/20
    shadow-[0_8px_32px_rgba(0,0,0,0.37)]
    p-10
    mt-10
  "
>
            
            <h2 className="font-orbitron text-3xl text-[#3CFF8F] mb-4
              ">
              Welcome, {username}! ⚡
            </h2>
             {stats && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        <StatCard label="Total Complaints" value={stats.total} color="#3CFF8F" />
        <StatCard label="Open" value={stats.open} color="#FFD93C" />
        <StatCard label="In Progress" value={stats.inprogress} color="#7CFFD8" />
        <StatCard label="Resolved" value={stats.resolved} color="#4CAF50" />
        <StatCard
  label="Last Complaint Status"
  value={stats.lastComplaintStatus || "No Complaints Yet"}
  color="#FFAA33"
/>
      </div>
    )}

            <ComplaintLifecycle />
          </div>
        )}

      </main>
    </div>
  );
}
