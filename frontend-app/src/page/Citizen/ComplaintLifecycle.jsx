// src/page/Citizen/ComplaintLifecycle.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "../../api/axiosInstance";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";

export default function ComplaintLifecycle() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editComplaint, setEditComplaint] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);

  const [timeLefts, setTimeLefts] = useState({});
  const [ratings, setRatings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("complaintRatings")) || {};
    } catch {
      return {};
    }
  });

  /* ---------------- FETCH COMPLAINTS ---------------- */

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
      // SLA timers
      const timers = {};
      data.forEach((c) => {
        timers[c._id] = calculateTimeLeft(c.deadline);
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



      
      setTimeLefts(timers);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  /* ---------------- SLA COUNTDOWN ---------------- */

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

  /* ---------------- CRUD ---------------- */

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this complaint?")) return;
    await axiosInstance.delete(`/api/complaints/${id}`);
    setComplaints((prev) => prev.filter((c) => c._id !== id));
  };

  const saveEdit = async () => {
    const formData = new FormData();
    formData.append("title", editComplaint.title);
    formData.append("description", editComplaint.description);
    formData.append("category", editComplaint.category);
    formData.append("priority", editComplaint.priority);

    if (editImageFile) {
      formData.append("photo", editImageFile);
    }

    const res = await axiosInstance.patch(
      `/api/complaints/${editComplaint._id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    setComplaints((prev) =>
      prev.map((c) => (c._id === res.data.complaint._id ? res.data.complaint : c))
    );

    setEditComplaint(null);
    setEditImageFile(null);
    setEditImagePreview(null);
  };

  /* ---------------- RATINGS ---------------- */

  // const submitRating = async (complaintId, rating) => {
  //   const token = localStorage.getItem("token");
  //   const complaint = complaints.find((c) => c._id === complaintId);

  //   if (!token || !complaint?.assigned_to?._id) return;

  //   try {
  //     await axios.post(
  //       `http://localhost:5000/api/users/${staffId}/rate`,
  //       { rating: ratingToSubmit },
  //       { headers: { "x-auth-token": token } }
  //     );
  //     alert("Rating submitted successfully!");
  //     await fetchComplaints(); 
  //   } catch (err) {
  //     console.error("Error submitting rating:", err);
  //     alert(err.response?.data?.message || "Failed to submit rating");
  //   }
  //   // await axios.post(
  //   //   `http://localhost:5000/api/users/${complaint.assigned_to._id}/rate`,
  //   //   { rating },
  //   //   { headers: { "x-auth-token": token } }
  //   // );

  //   setRatings((prev) => ({ ...prev, [complaintId]: rating }));
  // };

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
      // alert("Rating submitted successfully!");
      await fetchComplaints(); 
    } catch (err) {
      console.error("Error submitting rating:", err);
      // alert(err.response?.data?.message || "Failed to submit rating");
    }
  };

  /* ---------------- LOADING / ERROR ---------------- */

  if (loading)
    return <p className="text-[#B4FF5A]">Loading complaints...</p>;

  if (error)
    return (
      <div className="text-[#B4FF5A]">
        <p>{error}</p>
        <button onClick={fetchComplaints}>Retry</button>
      </div>
    );

  /* ---------------- UI ---------------- */

  return (
    <>
      <div className="space-y-5 mt-4">
        {complaints.map((c) => {
          const timeLeft = timeLefts[c._id];

          return (
            <div key={c._id} className="bg-white/10 p-6 rounded-xl">
              <h3 className="text-xl font-bold">{c.title}</h3>
              <p>{c.description}</p>

              <p>Status: {c.status}</p>

              {timeLeft && (
                <p className={timeLeft.total <= 0 ? "text-red-500" : "text-yellow-400"}>
                  {timeLeft.total > 0
                    ? `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`
                    : "Deadline passed"}
                </p>
              )}

              {c.status === "OPEN" && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setEditComplaint(c)}>Edit</button>
                  <button onClick={() => handleDelete(c._id)}>Delete</button>
                </div>
              )}

              <Rating
                style={{ maxWidth: 120 }}
                value={ratings[c._id] || 0}
                onChange={
                  (r) => {submitRating(c._id, r);
                    handleRatingChange(c._id,r)
                  }

                }
              />
            </div>
          );
        })}
      </div>

      {/* EDIT MODAL */}
      {editComplaint && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#00160D] p-6 rounded-xl w-[450px]">
            <input
              value={editComplaint.title}
              onChange={(e) =>
                setEditComplaint({ ...editComplaint, title: e.target.value })
              }
            />

            <textarea
              value={editComplaint.description}
              onChange={(e) =>
                setEditComplaint({ ...editComplaint, description: e.target.value })
              }
            />

            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                setEditImageFile(file);
                setEditImagePreview(URL.createObjectURL(file));
              }}
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setEditComplaint(null)}>Cancel</button>
              <button onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------- UTIL ---------------- */

function calculateTimeLeft(deadline) {
  if (!deadline) return { total: 0 };
  const diff = new Date(deadline) - Date.now();
  return {
    total: diff,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}
