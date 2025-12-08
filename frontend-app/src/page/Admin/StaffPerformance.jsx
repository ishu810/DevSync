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
  // FETCH STAFF + CALCULATE RATINGS
  // ------------------------------
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const res = await axiosInstance.get("/api/users/staff");

        const processed = res.data.map((staff) => {
          const ratings = staff.ratings || [];

          // ⭐ 1) Average Rating
          const averageRating =
            ratings.length > 0
              ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
              : 0;

          // ⭐ 2) Total Ratings
          const totalRatings = ratings.length;

          // ⭐ 3) Distribution (5 → 1 stars)
          const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          ratings.forEach((r) => {
            distribution[r.rating] = (distribution[r.rating] || 0) + 1;
          });

          return { ...staff, averageRating, totalRatings, distribution };
        });

        setStaffList(processed);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching staff:", error);
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
      (staff.username || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (staff.email || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
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
  // STAR RENDER
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

  // ------------------------------
  // CSV REPORT GENERATION
  // ------------------------------
  const generateReport = () => {
    const reportData = staffList.map((staff) => ({
      "Name": staff.username,
      "Email": staff.email,
      "Avg Rating": staff.averageRating.toFixed(1),
      "Total Ratings": staff.totalRatings,
      "5★": staff.distribution[5],
      "4★": staff.distribution[4],
      "3★": staff.distribution[3],
      "2★": staff.distribution[2],
      "1★": staff.distribution[1],
    }));

    const headers = Object.keys(reportData[0] || {});
    const csv = [
      headers.join(","),
      ...reportData.map((row) =>
        headers.map((h) => JSON.stringify(row[h])).join(",")
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "Staff_Performance_Report.csv";
    a.click();
  };

  if (loading)
    return (
      <div className="text-yellow-400 text-center mt-20 text-xl">
        Loading staff performance...
      </div>
    );

  return (
    <div className="flex min-h-screen bg-[#0B0D10] text-white relative font-inter overflow-hidden">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white/5 border-r border-white/10 p-6 z-20">
        <h1 className="font-orbitron text-2xl text-yellow-400 text-center mt-20">
          Admin Panel
        </h1>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="w-full bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2"
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate("/admin/complaints")}
            className="w-full bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2"
          >
            Complaints
          </button>

          <button className="w-full bg-yellow-400/30 border border-yellow-500 rounded-lg px-4 py-2">
            Staff Performance
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-10 z-10 mt-12">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="font-orbitron text-3xl text-yellow-400">
              Staff Performance
            </h1>
            <p className="text-white/60 text-sm">
              Ratings and feedback summary for all staff
            </p>
          </div>

          <button
            onClick={generateReport}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Download Report (CSV)
          </button>
        </div>

        {/* FILTERS */}
        <div className="bg-white/10 p-6 rounded-xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              className="bg-white/20 p-3 rounded-lg text-white"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/20 p-3 rounded-lg text-white"
            >
              <option value="name">Sort by Name</option>
              <option value="rating-high">Best Rated First</option>
              <option value="rating-low">Lowest Rated First</option>
              <option value="total-ratings">Most Ratings First</option>
            </select>

            <div className="text-white/50 flex items-center">
              {filteredAndSortedStaff.length} staff found
            </div>
          </div>
        </div>

        {/* STAFF LIST */}
        <div className="space-y-4">
          {filteredAndSortedStaff.map((staff) => (
            <div
              key={staff._id}
              className="bg-white/10 p-6 rounded-xl border border-white/10"
            >
              <div className="flex justify-between">

                {/* LEFT */}
                <div>
                  <h3 className="text-xl text-yellow-400">{staff.username}</h3>
                  <p className="text-white/60">{staff.email}</p>

                  <div className="flex items-center gap-3 mt-2">
                    {renderStars(staff.averageRating)}
                    <span className="text-white font-semibold">
                      {staff.averageRating.toFixed(1)}
                    </span>
                    <span className="text-white/50">
                      ({staff.totalRatings} ratings)
                    </span>
                  </div>
                </div>

                {/* RIGHT – DISTRIBUTION */}
                <div className="flex gap-3">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="text-center">
                      <span className="text-xs">{star}★</span>
                      <div className="w-12 h-2 bg-white/20 rounded mt-1">
                        <div
                          style={{
                            width:
                              (staff.distribution[star] /
                                staff.totalRatings) *
                              100 + "%",
                          }}
                          className="h-full bg-yellow-400 rounded"
                        />
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default StaffPerformance;
