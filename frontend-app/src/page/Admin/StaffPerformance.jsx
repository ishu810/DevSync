import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const StaffPerformance = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  // ------------------------------
  // FETCH STAFF WITH RATINGS
  // ------------------------------
  useEffect(() => {
    const fetchStaffData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      try {
        const staffRes = await axiosInstance.get("/api/users/staff");
        setStaffList(staffRes.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching staff data:", err);
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [navigate]);

  // ------------------------------
  // FILTER + SORT STAFF LIST
  // ------------------------------
  const filteredAndSortedStaff = staffList
    .filter((staff) =>
      staff.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.username.localeCompare(b.username);

        case "rating-high":
          return b.averageRating - a.averageRating;

        case "rating-low":
          return a.averageRating - b.averageRating;

        case "total-ratings":
          return b.totalRatings - a.totalRatings;

        default:
          return 0;
      }
    });

  // ------------------------------
  // RENDER STAR COMPONENT
  // ------------------------------
  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        className={`text-xl ${
          i <= Math.round(rating) ? "text-yellow-400" : "text-gray-600"
        }`}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="text-yellow-400 text-center mt-20 text-xl font-semibold">
        Loading Staff Performance...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0B0D10] text-white relative font-inter overflow-hidden">

      {/* Background Blur */}
      <div className="absolute inset-0 opacity-[0.25] bg-[url('./assets/devsync.jpg')] bg-cover bg-center blur-sm"></div>

      {/* SIDEBAR */}
      <aside className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 p-6 z-20">
        <h1 className="font-orbitron text-2xl text-yellow-400 text-center tracking-wider mt-20">
          Admin Panel
        </h1>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="w-full bg-white/10 hover:bg-white/20 transition rounded-lg px-4 py-2 text-left"
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate("/admin/complaints")}
            className="w-full bg-white/10 hover:bg-white/20 transition rounded-lg px-4 py-2 text-left"
          >
            Complaints
          </button>

          <button
            className="w-full bg-yellow-400/20 hover:bg-yellow-400/30 transition rounded-lg px-4 py-2 text-left border border-yellow-400/50"
          >
            Staff Performance
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 z-10 mt-12">

        {/* PAGE HEADER */}
        <div className="mb-8">
          <h1 className="font-orbitron text-3xl text-yellow-400 mb-2">
            Staff Performance
          </h1>
          <p className="text-white/70">
            View and analyze staff performance based on user ratings
          </p>
        </div>

        {/* FILTER SECTION */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-3 rounded-lg bg-white/20 border border-white/30 text-white"
            >
              <option value="name">Sort by Name</option>
              <option value="rating-high">Best Rated First</option>
              <option value="rating-low">Lowest Rated First</option>
              <option value="total-ratings">Most Ratings First</option>
            </select>

            <div className="text-white/70 flex items-center justify-center">
              {filteredAndSortedStaff.length} staff found
            </div>
          </div>
        </div>

        {/* STAFF LIST */}
        <div className="space-y-4">

          {filteredAndSortedStaff.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
              <p className="text-white/70 text-lg">No staff members match your search.</p>
            </div>
          ) : (
            filteredAndSortedStaff.map((staff) => (
              <div
                key={staff._id}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition"
              >
                <div className="flex flex-col md:flex-row justify-between">

                  {/* LEFT SECTION */}
                  <div>
                    <h3 className="text-xl font-semibold text-yellow-400 mb-1">
                      {staff.username}
                    </h3>
                    <p className="text-white/70 mb-2">{staff.email}</p>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        {renderStars(staff.averageRating)}
                        <span className="ml-2 text-white font-semibold">
                          {staff.averageRating > 0 ? staff.averageRating.toFixed(1) : "No ratings"}
                        </span>
                      </div>

                      <span className="text-white/60">
                        ({staff.totalRatings} {staff.totalRatings === 1 ? "rating" : "ratings"})
                      </span>
                    </div>
                  </div>

                  {/* RIGHT SECTION */}
                  <div className="mt-4 md:mt-0 text-right">

                    {/* PERFORMANCE LEVEL */}
                    <div className="text-sm text-white/60">Performance Level</div>
                    <div
                      className={`font-bold text-lg ${
                        staff.averageRating >= 4.5
                          ? "text-green-400"
                          : staff.averageRating >= 3.5
                          ? "text-blue-400"
                          : staff.averageRating >= 2.5
                          ? "text-yellow-400"
                          : staff.averageRating > 0
                          ? "text-orange-400"
                          : "text-gray-400"
                      }`}
                    >
                      {staff.averageRating >= 4.5
                        ? "Excellent"
                        : staff.averageRating >= 3.5
                        ? "Good"
                        : staff.averageRating >= 2.5
                        ? "Average"
                        : staff.averageRating > 0
                        ? "Needs Improvement"
                        : "Not Rated"}
                    </div>

                    {/* RATING DISTRIBUTION */}
                    {staff.totalRatings > 0 && (
                      <div className="mt-3 text-sm text-white/60">Rating Breakdown</div>
                    )}

                    <div className="flex space-x-2 mt-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const pct =
                          staff.totalRatings > 0
                            ? (staff.distribution?.[star] / staff.totalRatings) * 100
                            : 0;

                        return (
                          <div key={star} className="flex flex-col items-center">
                            <span className="text-xs">{star}★</span>
                            <div className="w-10 h-2 bg-white/20 rounded">
                              <div
                                className="h-full bg-yellow-400 rounded"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default StaffPerformance;