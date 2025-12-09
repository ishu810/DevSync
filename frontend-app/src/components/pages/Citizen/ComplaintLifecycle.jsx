
import React, { useEffect, useState } from "react";
import axios from "axios";
import CommentSection from "./CommentSection";

const COLORS = {
  violetDark: "#2e1834",
  violetMid: "#4B0082",
  gold: "#CC9901",
  white: "#ffffff",
};

export default function ComplaintLifecycle() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchComplaints = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to view complaints.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/api/complaints", {
        headers: { "x-auth-token": token },
      });

      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch complaints"
      );
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  if (loading)
    return (
      <p style={{ color: COLORS.gold, fontWeight: "bold" }}>
        Loading complaints...
      </p>
    );

  if (error)
    return (
      <div style={{ color: COLORS.gold, fontFamily: "Poppins, sans-serif" }}>
        <p>Error: {error}</p>
        <button
          onClick={fetchComplaints}
          style={{
            backgroundColor: COLORS.violetDark,
            color: COLORS.white,
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            cursor: "pointer",
            border: "none",
          }}
        >
          Retry
        </button>
      </div>
    );

  return (
    <div style={{ fontFamily: "Poppins, sans-serif", padding: "0.5rem 0.8rem" }}>
  {complaints.length === 0 ? (
    <p style={{ color: "#CCFF99" }}>No complaints submitted yet.</p>
  ) : (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {complaints.map((c) => (
        <li
          key={c._id}
          style={{
            marginBottom: "0.9rem",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            backgroundColor: "rgba(0, 40, 0, 0.35)",
            border: "1px solid rgba(0,255,0,0.25)",
            boxShadow: "0 0 10px rgba(0,255,0,0.18)",
            color: "#e8ffe8",
            backdropFilter: "blur(3px)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.015)";
            e.currentTarget.style.boxShadow =
              "0 0 14px rgba(0,255,0,0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow =
              "0 0 10px rgba(0,255,0,0.18)";
          }}
        >
          <h3
            style={{
              margin: "0 0 0.3rem 0",
              color: "#66ff99",
              fontSize: "1rem",
              fontWeight: "600"
            }}
          >
            {c.title}
          </h3>

          <p style={{ margin: "0.25rem 0", fontSize: "0.9rem" }}>
            {c.description}
          </p>

          <p style={{ margin: "0.15rem 0", fontSize: "0.75rem", color: "#b6ffb6" }}>
            Status: {c.status || "OPEN"}
          </p>

          {c.submitted_by && (
            <p style={{ margin: "0.15rem 0", fontSize: "0.75rem", color: "#b6ffb6" }}>
              Submitted by: {c.submitted_by.username} ({c.submitted_by.email})
            </p>
          )}

          {c.createdAt && (
            <p style={{ margin: "0.15rem 0", fontSize: "0.75rem", color: "#b6ffb6" }}>
              Date: {new Date(c.createdAt).toLocaleString()}
            </p>
          )}

          {c.photo_url && (
            <img
              src={c.photo_url}
              alt="Complaint"
              style={{
                maxWidth: "100%",
                marginTop: "0.5rem",
                borderRadius: "5px",
                border: "1px solid rgba(0,255,0,0.3)"
              }}
            />
          )}

          <div style={{ marginTop: "0.5rem" }}>
            <CommentSection complaintId={c._id} />
          </div>
        </li>
      ))}
    </ul>
  )}
</div>

  );
}