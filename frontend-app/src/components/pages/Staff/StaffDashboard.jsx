import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import CommentSection from "../Citizen/CommentSection"; 

const StaffDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filters, setFilters] = useState({ status: "All", priority: "All" });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/complaints", {
          headers: { "x-auth-token": token },
        });
        setComplaints(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        alert("Failed to fetch complaints. Please login again.");
      }
    };
    fetchComplaints();
  }, []);

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      setUpdating(complaintId);
      const token = localStorage.getItem("token");
      await axiosInstance.patch(
        "/api/complaints/status",
        { complaintId, status: newStatus },
        { headers: { "x-auth-token": token } }
      );
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

  // Filter, search, and sort complaints
  const filteredComplaints = complaints
    .filter(
      (c) =>
        (filters.status === "All" || c.status === filters.status) &&
        (filters.priority === "All" || c.priority === filters.priority) &&
        (c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.category.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "latest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "priority") {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });

  if (loading) return <p style={{ color: "#b6ffb6" }}>Loading complaints...</p>;

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "Poppins, sans-serif",
        background: "rgba(0, 30, 0, 0.7)",
        minHeight: "100vh",
        color: "#e8ffe8",
        backdropFilter: "blur(4px)",
      }}
    >
      <h2 style={{ color: "#66ff99", marginBottom: "1rem" }}>Staff Dashboard</h2>

      {/* Search & Filters */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search by title or category"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "0.5rem",
            borderRadius: "6px",
            border: "1px solid rgba(0,255,0,0.4)",
            background: "rgba(0, 40, 0, 0.35)",
            color: "#e8ffe8",
            flex: "1",
            minWidth: "200px",
          }}
        />

        {/* Status Filter */}
        <div>
          <label style={{ color: "#b6ffb6" }}>Status: </label>
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            style={{
              padding: "0.4rem 0.6rem",
              borderRadius: "6px",
              border: "none",
              background: "rgba(0,255,0,0.25)",
              color: "#003300",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {["All", "OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"].map(
              (status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              )
            )}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label style={{ color: "#b6ffb6" }}>Priority: </label>
          <select
            value={filters.priority}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, priority: e.target.value }))
            }
            style={{
              padding: "0.4rem 0.6rem",
              borderRadius: "6px",
              border: "none",
              background: "rgba(0,255,0,0.25)",
              color: "#003300",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {["All", "Low", "Medium", "High"].map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label style={{ color: "#b6ffb6" }}>Sort: </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "0.4rem 0.6rem",
              borderRadius: "6px",
              border: "none",
              background: "rgba(0,255,0,0.25)",
              color: "#003300",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      {/* Complaint Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
        {filteredComplaints.map((c) => (
          <div
            key={c._id}
            style={{
              background: "rgba(0, 40, 0, 0.35)",
              border: "1px solid rgba(0,255,0,0.25)",
              borderRadius: "8px",
              boxShadow: "0 0 12px rgba(0,255,0,0.15)",
              padding: "0.8rem 1rem",
              backdropFilter: "blur(3px)",
            }}
          >
            <h3 style={{ margin: "0 0 0.3rem 0", color: "#66ff99" }}>
              {c.title}
              <span style={{ fontWeight: "normal", color: "#b6ffb6" }}>
                {" "}
                - {c.status}
              </span>
            </h3>

            <p style={{ margin: "0.25rem 0" }}>{c.description}</p>
            <p style={{ margin: "0.15rem 0", fontSize: "0.8rem", color: "#b6ffb6" }}>
              Category: {c.category} | Priority: {c.priority}
            </p>

            {c.photo_url && (
              <img
                src={c.photo_url}
                alt="Complaint"
                style={{
                  maxWidth: "100%",
                  borderRadius: "5px",
                  border: "1px solid rgba(0,255,0,0.25)",
                  marginTop: "0.4rem",
                }}
              />
            )}

            {/* COMMENT SECTION FOR STAFF */}
            <div style={{ marginTop: "0.6rem" }}>
              <CommentSection complaintId={c._id} />
            </div>

            {/* STATUS UPDATE  */}
            <div style={{ marginTop: "0.6rem" }}>
              <label style={{ marginRight: "0.4rem", color: "#b6ffb6" }}>
                Update Status:
              </label>
              <select
                value={c.status}
                onChange={(e) => handleStatusChange(c._id, e.target.value)}
                disabled={updating === c._id}
                style={{
                  padding: "0.35rem 0.6rem",
                  borderRadius: "6px",
                  border: "none",
                  background: "rgba(0,255,0,0.25)",
                  color: "#003300",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"].map(
                  (status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  )
                )}
              </select>
              {updating === c._id && (
                <span style={{ marginLeft: "0.4rem" }}>Updating...</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffDashboard;