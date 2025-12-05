import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";

export default function ComplaintCountdown() {
  const [complaints, setComplaints] = useState([]);

  // Fetch complaints for the logged-in user
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axiosInstance.get("/api/complaints"); // auth token included automatically
        setComplaints(res.data); // res.data is array of complaints
      } catch (err) {
        console.error("Error fetching complaints:", err);
      }
    };

    fetchComplaints();
  }, []);

  // Custom hook to calculate remaining time for a deadline
  const [timeLefts, setTimeLefts] = useState({}); // key: complaint id, value: timeLeft object

  useEffect(() => {
    if (!complaints.length) return;

    const intervalId = setInterval(() => {
      const newTimes = {};
      complaints.forEach((c) => {
        newTimes[c._id] = calculateTimeLeft(c.deadline);
      });
      setTimeLefts(newTimes);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [complaints]);

  if (!complaints.length) return <p>Loading complaints...</p>;

  return (
    <div>
      {complaints.map((c) => {
        const timeLeft = timeLefts[c._id];
        if (!timeLeft) return null;

        return (
          <div key={c._id} style={{ marginBottom: "10px" }}>
            <strong>Complaint: {c.title || c._id}</strong>
            {timeLeft.total > 0 ? (
              <span>
                {" "}
                - {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m{" "}
                {timeLeft.seconds}s
              </span>
            ) : (
              <span> - Deadline passed</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Helper function
function calculateTimeLeft(deadline) {
  const now = new Date().getTime();
  const due = new Date(deadline).getTime();
  const diff = due - now;
  const total = diff;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { total, days, hours, minutes, seconds };
}
