import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [assignData, setAssignData] = useState({ complaintId: "", staffId: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      try {
        const dashboardRes = await axiosInstance.get("/api/dashboard/admin");
        setUsername(dashboardRes.data.msg.replace("Welcome admin ", ""));

        const complaintRes = await axiosInstance.get("/api/complaints");
        setComplaints(Array.isArray(complaintRes.data) ? complaintRes.data : []);

        const staffRes = await axiosInstance.get("/api/users/staff");
        setStaffList(staffRes.data || []);

        setLoading(false);
      } catch (err) {
        alert("Authorization failed");
        navigate("/login");
      }
    };

    fetchData();
  }, [navigate]);

  const handleAssign = async () => {
    if (!assignData.complaintId || !assignData.staffId)
      return alert("Select complaint & staff");

    try {
      const res = await axiosInstance.patch("/api/complaints/assign", assignData);
      alert(res.data.message);

      setComplaints((prev) =>
        prev.map((c) => (c._id === res.data.complaint._id ? res.data.complaint : c))
      );

      setAssignData({ complaintId: "", staffId: "" });
    } catch {
      alert("Assign failed");
    }
  };

  if (loading)
    return (
      <div className="text-yellow-400 text-center mt-20 text-xl font-semibold">
        Loading Admin Dashboard...
      </div>
    );

  return (
    <div className="flex min-h-screen bg-[#0B0D10] text-white relative font-inter overflow-hidden">

      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 opacity-[0.12] pointer-events-none bg-[url('https://i.ibb.co/bvBWG0B/grid.png')]"></div>

      {/* NEON GLOWS */}
      <div className="absolute w-[380px] h-[380px] bg-blue-500 blur-[150px] opacity-30 top-[-100px] left-[-100px]"></div>
      <div className="absolute w-[400px] h-[400px] bg-yellow-400 blur-[150px] opacity-25 bottom-[-120px] right-[-150px]"></div>

      {/* SIDEBAR */}
      <aside className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 p-6 z-20">
        <h1 className="font-orbitron text-2xl text-yellow-400 text-center tracking-wider">
          Admin Panel
        </h1>

        <p className="mt-3 text-center text-white/80">👑 {username}</p>

        <div className="mt-6 space-y-3">
          <button className="w-full bg-white/10 hover:bg-white/20 transition rounded-lg px-4 py-2 text-left border border-transparent hover:border-blue-400 shadow-md">
            Dashboard
          </button>
          <button className="w-full bg-white/10 hover:bg-white/20 transition rounded-lg px-4 py-2 text-left">
            Complaints
          </button>
          <button className="w-full bg-white/10 hover:bg-white/20 transition rounded-lg px-4 py-2 text-left">
            Staff
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 z-10">

        {/* ASSIGN COMPLAINT CARD */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 mb-10">
          <h2 className="font-orbitron text-xl mb-4 text-yellow-400">Assign Complaints</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={assignData.complaintId}
              onChange={(e) =>
                setAssignData({ ...assignData, complaintId: e.target.value })
              }
              className="p-3 rounded-lg bg-white/20 border border-white/30 text-white focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Complaint</option>
              {complaints.map((c) => (
                <option key={c._id} value={c._id} className="text-black">
                  {c.title} — ({c.status})
                </option>
              ))}
            </select>

            <select
              value={assignData.staffId}
              onChange={(e) =>
                setAssignData({ ...assignData, staffId: e.target.value })
              }
              className="p-3 rounded-lg bg-white/20 border border-white/30 text-white focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Staff</option>
              {staffList.map((s) => (
                <option key={s._id} value={s._id} className="text-black">
                  {s.username}
                </option>
              ))}
            </select>

            <button
              onClick={handleAssign}
              className="bg-yellow-400 text-black font-bold rounded-lg px-6 py-3 shadow-lg hover:bg-yellow-300 transition"
            >
              Assign
            </button>
          </div>
        </div>

        {/* COMPLAINT TABLE */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6">
          <h2 className="font-orbitron text-xl mb-4 text-yellow-400">
            All Complaints
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="p-3 font-semibold">Title</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Assigned To</th>
                  <th className="p-3 font-semibold">Category</th>
                </tr>
              </thead>

              <tbody>
                {complaints.map((c) => (
                  <tr
                    key={c._id}
                    className="bg-white/10 border-b border-white/20 hover:bg-white/20 transition"
                  >
                    <td className="p-3">{c.title}</td>
                    <td className="p-3">{c.status}</td>
                    <td className="p-3">{c.assigned_to?.username || "Unassigned"}</td>
                    <td className="p-3">{c.category}</td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
