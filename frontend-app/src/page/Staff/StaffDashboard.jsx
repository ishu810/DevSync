import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import StatCard from "../../components/StatCard";

export default function StaffDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filters, setFilters] = useState({ status: "All", priority: "All" });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [stats, setStats] = useState(null);
  const [timeLefts, setTimeLefts] = useState({});

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axiosInstance.get("/api/complaints");
        setComplaints(res.data);

        const statsRes = await axiosInstance.get("/api/users/stats");
        setStats(statsRes.data);

        // Initialize SLA timers
        const initialTimes = {};
        res.data.forEach((c) => {
          initialTimes[c._id] = calculateTimeLeft(c.deadline);
        });
        setTimeLefts(initialTimes);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        alert("Failed to fetch complaints. Please login again.");
      }
    };

    fetchComplaints();
  }, []);

  // Update SLA countdown every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      const newTimes = {};
      complaints.forEach((c) => {
        newTimes[c._id] = calculateTimeLeft(c.deadline);
      });
      setTimeLefts(newTimes);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [complaints]);

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      setUpdating(complaintId);

      await axiosInstance.patch("/api/complaints/status", {
        complaintId,
        status: newStatus,
      });

      setComplaints((prev) =>
        prev.map((c) =>
          c._id === complaintId ? { ...c, status: newStatus } : c
        )
      );

      setUpdating(null);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
      setUpdating(null);
    }
  };

  const filteredComplaints = complaints
    .filter(
      (c) =>
        (filters.status === "All" || c.status === filters.status) &&
        (filters.priority === "All" || c.priority === filters.priority) &&
        c.title.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "latest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "priority") {
        const order = { High: 3, Medium: 2, Low: 1 };
        return order[b.priority] - order[a.priority];
      }
      return 0;
    });

  if (loading)
    return (
      <p className="text-center mt-20 text-[#7AFF57] font-semibold text-lg">
        Loading complaints...
      </p>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00160D] via-[#003A20] to-[#000d05] text-white p-6">

      <h2 className="text-3xl font-orbitron font-bold text-[#7AFF57] mb-6 mt-16">
        ENGINEER Dashboard
      </h2>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard label="Total Assigned" value={stats.total} color="#7AFF57" />
          <StatCard label="Open" value={stats.open} color="#FFD93C" />
          <StatCard label="In Progress" value={stats.inProgress} color="#00CFFF" />
          <StatCard label="Resolved" value={stats.resolved} color="#4CAF50" />
          <StatCard label="Closed" value={stats.closed} color="#9CA3AF" />
          <StatCard label="SLA Breaches" value={stats.slaViolations} color="#FF4444" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 bg-[#003A20]/20 p-4 rounded-xl border border-[#39FF14]/30">
        <input
          type="text"
          placeholder="Search by title..."
          className="flex-1 px-4 py-2 rounded-lg bg-black/40 border border-[#39FF14]/40 text-[#A6FFCB]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-4 py-2 rounded-lg bg-[#39FF14]/30 text-white border border-[#39FF14]/40"
        >
          {["All", "OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
            <option key={s} className="bg-black text-white">
              {s}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="px-4 py-2 rounded-lg bg-[#39FF14]/30 text-white border border-[#39FF14]/40"
        >
          {["All", "Low", "Medium", "High"].map((p) => (
            <option key={p} className="bg-black text-white">
              {p}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 rounded-lg bg-[#39FF14]/30 text-white border"
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      {/* Complaint List */}
      <div className="flex flex-col gap-5">
        {filteredComplaints.length === 0 && (
          <p className="text-[#A6FFCB]">No complaints found.</p>
        )}

        {filteredComplaints.map((c) => {
          const timeLeft = timeLefts[c._id];

          return (
            <div
              key={c._id}
              className="bg-[#00160D]/70 border border-[#39FF14]/30 rounded-xl p-5"
            >
              <h3 className="text-xl font-semibold text-[#7AFF57]">
                {c.title} <span className="text-[#39FF14]">({c.status})</span>
              </h3>

              <p className="mt-1 text-[#D9FFE8]">{c.description}</p>

              <p className="text-sm mt-2 text-[#7AFF57]">
                <strong>Category:</strong> {c.category} &nbsp;|&nbsp;
                <strong>Priority:</strong> {c.priority}
              </p>

              {/* SLA TIMER */}
              {timeLeft && (
                <p
                  className={`mt-2 font-semibold ${
                    timeLeft.total <= 0 ? "text-red-500" : "text-yellow-400"
                  }`}
                >
                  Deadline:{" "}
                  {timeLeft.total > 0
                    ? `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`
                    : "Deadline passed"}
                </p>
              )}

              {c.photo_url && (
                <img
                  src={c.photo_url}
                  alt="Complaint"
                  className="rounded-lg mt-3 border border-[#39FF14]"
                />
              )}

              {/* STATUS UPDATE */}
              <div className="mt-4">
                <label className="mr-2 text-[#A6FFCB]">Update Status:</label>

                <select
                  value={c.status}
                  disabled={updating === c._id}
                  onChange={(e) => handleStatusChange(c._id, e.target.value)}
                  className="px-3 py-2 rounded-lg bg-[#39FF14]/30 text-white border"
                >
                  {["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"].map(
                    (s) => (
                      <option key={s} className="bg-black text-white">
                        {s}
                      </option>
                    )
                  )}
                </select>

                {updating === c._id && (
                  <span className="ml-3 text-[#7AFF57] animate-pulse">
                    Updating...
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper: SLA Timer
function calculateTimeLeft(deadline) {
  if (!deadline)
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

  const now = Date.now();
  const due = new Date(deadline).getTime();
  const diff = due - now;

  return {
    total: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}
