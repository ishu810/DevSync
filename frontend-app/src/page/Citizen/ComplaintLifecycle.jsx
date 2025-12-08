// src/page/Citizen/ComplaintLifecycle.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";

export default function ComplaintLifecycle() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLefts, setTimeLefts] = useState({});

  // ratings state persists via localStorage
  const [ratings, setRatings] = useState(() => {
    try {
      const ls = localStorage.getItem("complaintRatings");
      return ls ? JSON.parse(ls) : {};
    } catch {
      return {};
    }
  });

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
      const data = Array.isArray(res.data) ? res.data : [];
      setComplaints(data);

      // SLA timer
      const initialTimes = {};
      data.forEach((c) => {
        initialTimes[c._id] = calculateTimeLeft(c.deadline);
      });
      setTimeLefts(initialTimes);

      const backendRatings = {};
      data.forEach((c) => {
        const myRatingObj = c.assigned_to?.ratings?.find(
          (r) => r.rater === localStorage.getItem("userId")
        );
        if (myRatingObj) {
          backendRatings[c._id] = myRatingObj.rating;
        }
      });

      const stored = (() => {
        try {
          return JSON.parse(localStorage.getItem("complaintRatings") || "{}");
        } catch {
          return {};
        }
      })();

      const merged = { ...stored, ...backendRatings };
      setRatings(merged);
      try {
        localStorage.setItem("complaintRatings", JSON.stringify(merged));
      } catch {  }

    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch complaints");
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // SLA countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const updated = {};
      complaints.forEach((c) => {
        updated[c._id] = calculateTimeLeft(c.deadline);
      });
      setTimeLefts(updated);
    }, 1000);
    return () => clearInterval(interval);
  }, [complaints]);

  const handleRatingChange = (complaintId, newRating) => {
    setRatings((prev) => {
      const updated = { ...prev, [complaintId]: newRating };
      try {
        localStorage.setItem("complaintRatings", JSON.stringify(updated));
      } catch { }
      return updated;
    });
  };

  const submitRating = async (complaintId, ratingValue) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to rate");
      return;
    }

    const ratingToSubmit = ratingValue ?? ratings[complaintId];
    if (!ratingToSubmit) {
      alert("Please select a rating first");
      return;
    }

    const complaint = complaints.find((c) => c._id === complaintId);
    if (!complaint || !complaint.assigned_to?._id) {
      alert("No staff assigned to this complaint");
      return;
    }

    const staffId = complaint.assigned_to._id;

    try {
      await axios.post(
        `http://localhost:5000/api/users/${staffId}/rate`,
        { rating: ratingToSubmit },
        { headers: { "x-auth-token": token } }
      );
      alert("Rating submitted successfully!");
      await fetchComplaints(); 
    } catch (err) {
      console.error("Error submitting rating:", err);
      alert(err.response?.data?.message || "Failed to submit rating");
    }
  };

  if (loading) {
    return <p className="text-[#B4FF5A] font-semibold text-lg">Loading complaints...</p>;
  }

  if (error) {
    return (
      <div className="text-[#B4FF5A]">
        <p>Error: {error}</p>
        <button
          onClick={fetchComplaints}
          className="mt-3 px-4 py-2 bg-[#3CFF8F]/20 text-white font-semibold border border-[#3CFF8F]/40 rounded-xl hover:bg-[#3CFF8F]/30 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 mt-4">
      {complaints.length === 0 ? (
        <p className="text-[#3CFF8F]">No complaints submitted yet.</p>
      ) : (
        complaints.map((c) => {
          const timeLeft = timeLefts[c._id];
          const storedRating = ratings[c._id];
          return (
            <div
              key={c._id}
              className="bg-white/10 backdrop-blur-xl rounded-2xl border border-[#3CFF8F]/40 shadow p-6 text-white"
            >
              <h3 className="text-xl font-bold mb-2">{c.title}</h3>
              <p className="text-gray-200 mb-3">{c.description}</p>
              <p className="text-[#B4FF5A] text-sm mb-1">
                <span className="font-semibold">Status:</span> {c.status || "OPEN"}
              </p>
              {timeLeft && (
                <p className={`mt-2 font-semibold ${timeLeft.total <= 0 ? "text-red-500" : "text-yellow-400"}`}>
                  Deadline: { timeLeft.total > 0
                    ? `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`
                    : "Deadline passed"
                  }
                </p>
              )}
              {c.submitted_by && (
                <p className="text-gray-300 text-sm mb-1">
                  Submitted by: {c.submitted_by.username} ({c.submitted_by.email})
                </p>
              )}
              {c.createdAt && (
                <p className="text-gray-400 text-xs mb-3">{new Date(c.createdAt).toLocaleString()}</p>
              )}
              {c.photo_url && (
                <img
                  src={c.photo_url}
                  alt="Complaint"
                  className="w-full mt-3 rounded-xl border shadow-lg object-cover aspect-square max-w-sm mx-auto"
                  loading="lazy"
                  onClick={() => window.open(c.photo_url, '_blank')}
                  style={{ cursor: 'pointer' }}
                />
              )}

              {storedRating != null ? (
                <p className="mt-4 text-yellow-300">You rated staff: {storedRating} ★</p>
              ) : (
                <div className="mt-4 flex items-center space-x-3">
                  <Rating
                    style={{ maxWidth: 120 }}
                    value={ratings[c._id] || 0}
                    onChange={(newRating) => {
                      handleRatingChange(c._id, newRating);
                      submitRating(c._id, newRating);
                    }}
                  />
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function calculateTimeLeft(deadline) {
  if (!deadline) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  const now = Date.now();
  const target = new Date(deadline).getTime();
  const diff = target - now;
  return {
    total: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}
