import React, { useEffect, useState } from "react";
import axios from "axios";

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
      setError(err.response?.data?.message || "Failed to fetch complaints");
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
      <p className="text-[#B4FF5A] font-semibold text-lg">Loading complaints...</p>
    );

  if (error)
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

  return (
    <div className="space-y-5 mt-4">

      {complaints.length === 0 ? (
        <p className="text-[#B4FF5A]">No complaints submitted yet.</p>
      ) : (
        complaints.map((c) => (
          <div
            key={c._id}
            className="
              bg-white/10 
              backdrop-blur-xl 
              rounded-2xl
              border border-[#3CFF8F]/40
              shadow-[0_8px_32px_rgba(0,0,0,0.37)]
              p-6 
              text-white
              transition 
              hover:scale-[1.02]
              hover:shadow-[0_0_20px_#3CFF8F]
            "
          >
            {/* TITLE */}
            <h3 className="text-[#7CFFD8] text-xl font-bold mb-2 drop-shadow-[0_0_5px_#3CFF8F]">
              {c.title}
            </h3>

            {/* DESCRIPTION */}
            <p className="text-gray-200 mb-3">{c.description}</p>

            {/* STATUS */}
            <p className="text-[#B4FF5A] text-sm mb-1">
              <span className="font-semibold">Status:</span> {c.status || "OPEN"}
            </p>

            {/* SUBMITTED BY */}
            {c.submitted_by && (
              <p className="text-gray-300 text-sm mb-1">
                Submitted by:{" "}
                <span className="text-[#7CFFD8]">
                  {c.submitted_by.username} ({c.submitted_by.email})
                </span>
              </p>
            )}

            {/* DATE */}
            {c.createdAt && (
              <p className="text-gray-400 text-xs mb-3">
                Date: {new Date(c.createdAt).toLocaleString()}
              </p>
            )}

            {/* PHOTO */}
            {c.photo_url && (
              <img
                src={c.photo_url}
                alt="Complaint"
                className="
                  w-full mt-3 rounded-xl 
                  border border-[#7CFFD8]/30 
                  shadow-[0_0_12px_#7CFFD8]/30
                "
              />
            )}
          </div>
        ))
      )}
    </div>
  );
}
