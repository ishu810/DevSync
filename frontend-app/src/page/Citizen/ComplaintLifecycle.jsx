import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

export default function ComplaintLifecycle() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editComplaint, setEditComplaint] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
const [editImageFile, setEditImageFile] = useState(null);


  const fetchComplaints = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axiosInstance.get("/api/complaints");
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

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
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  setComplaints((prev) =>
    prev.map((c) =>
      c._id === res.data.complaint._id ? res.data.complaint : c
    )
  );

  setEditComplaint(null);
  setEditImageFile(null);
  setEditImagePreview(null);
};


  useEffect(() => {
    fetchComplaints();
  }, []);

  if (loading) return <p className="text-[#B4FF5A]">Loading complaints...</p>;

  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <>
      {/* COMPLAINT LIST */}
      <div className="space-y-5 mt-4">
        {complaints.length === 0 ? (
          <p className="text-[#B4FF5A]">No complaints submitted yet.</p>
        ) : (
          complaints.map((c) => (
            <div
              key={c._id}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-[#3CFF8F]/40"
            >
              <h3 className="text-xl font-bold">{c.title}</h3>
              <p className="text-gray-200 mb-2">{c.description}</p>
              <p className="text-sm text-[#B4FF5A]">
                Status: {c.status}
              </p>

              {c.status === "OPEN" && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setEditComplaint(c)}
                    className="px-3 py-1 bg-blue-500 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="px-3 py-1 bg-red-500 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* EDIT MODAL */}
      {editComplaint && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-[#00160D] p-6 rounded-xl w-[450px] border border-[#3CFF8F]/40">
      <h2 className="text-xl font-orbitron text-[#3CFF8F] mb-4">
        Edit Complaint
      </h2>

      {/* Title */}
      <input
        className="w-full p-2 mb-3 bg-black/40 rounded text-white"
        value={editComplaint.title}
        onChange={(e) =>
          setEditComplaint({ ...editComplaint, title: e.target.value })
        }
      />

      {/* Description */}
      <textarea
        className="w-full p-2 mb-3 bg-black/40 rounded text-white"
        rows={4}
        value={editComplaint.description}
        onChange={(e) =>
          setEditComplaint({
            ...editComplaint,
            description: e.target.value,
          })
        }
      />

      {/* Category */}
      <select
        className="w-full p-2 mb-3 bg-black/40 rounded text-white"
        value={editComplaint.category}
        onChange={(e) =>
          setEditComplaint({ ...editComplaint, category: e.target.value })
        }
      >
        <option>Infrastructure</option>
        <option>Sanitation</option>
        <option>Water</option>
        <option>Electricity</option>
        <option>Other</option>
      </select>

      {/* Priority */}
      <select
        className="w-full p-2 mb-3 bg-black/40 rounded text-white"
        value={editComplaint.priority}
        onChange={(e) =>
          setEditComplaint({ ...editComplaint, priority: e.target.value })
        }
      >
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>

      {/* Photo upload */}
      <input
        type="file"
        accept="image/*"
        className="mb-3 text-white"
        onChange={(e) => {
          const file = e.target.files[0];
          if (!file) return;

          setEditImageFile(file);
          setEditImagePreview(URL.createObjectURL(file));
        }}
      />

      {/* Preview */}
      {(editImagePreview || editComplaint.photo_url) && (
        <img
          src={editImagePreview || editComplaint.photo_url}
          alt="Preview"
          className="rounded-lg mb-3"
        />
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            setEditComplaint(null);
            setEditImageFile(null);
            setEditImagePreview(null);
          }}
          className="px-4 py-2 bg-gray-600 rounded"
        >
          Cancel
        </button>

        <button
          onClick={saveEdit}
          className="px-4 py-2 bg-[#3CFF8F] text-black rounded"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}

    </>
  );
}
