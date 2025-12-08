import React, { useState, useEffect } from "react";
import axios from "axios";

const ComplaintForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Other",
    priority: "Low",
    address: "",
    latitude: null,
    longitude: null,
    photo: null,
  });

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData((prev) => ({ ...prev, latitude, longitude }));
      },
      () => alert("Please enable location access.")
    );
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, photo: file });
    setPreview(URL.createObjectURL(file));// creates a url for the image uploaded
  };

  const refreshLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData((prev) => ({ ...prev, latitude, longitude }));
        alert("Location updated!");
      },
      () => alert("Unable to refresh location")
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.latitude || !formData.longitude) {
      alert("Location needed");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) data.append(key, formData[key]);
    });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/complaints",
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message || "Complaint Submitted!");

      setFormData({
        title: "",
        description: "",
        category: "Other",
        priority: "Low",
        address: "",
        latitude: formData.latitude,
        longitude: formData.longitude,
        photo: null,
      });
      setPreview(null);
    } catch (err) {
      if (err.response?.status === 429) {
        const remainingTime = err.response?.data?.remainingTime || err.response?.data?.retryAfter;
        const message = remainingTime 
          ? `Rate limit exceeded. Please try again in ${remainingTime} seconds.`
          : "Rate limit exceeded. Too many complaints. Please try again later.";
        alert(message);
      } else {
        alert("Error: " + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-4 font-poppins">
      <div className="bg-white rounded-xl p-8 shadow-2xl w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold text-green-900 mb-6">
          Submit a Complaint
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title */}
          <div>
            <label className="text-green-900 font-medium">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Complaint Title"
              required
              className="w-full p-3 border border-green-700 rounded-lg 
              text-black placeholder-gray-600
              focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-green-900 font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
              placeholder="Complaint Description"
              className="w-full p-3 border border-green-700 rounded-lg 
              text-black placeholder-gray-600
              focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-green-900 font-medium">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 border border-green-700 rounded-lg 
              text-black bg-white focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option>Infrastructure</option>
              <option>Sanitation</option>
              <option>Water</option>
              <option>Electricity</option>
              <option>Other</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="text-green-900 font-medium">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full p-3 border border-green-700 rounded-lg 
              text-black bg-white"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="text-green-900 font-medium">Address (optional)</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Your Address"
              className="w-full p-3 border border-green-700 rounded-lg 
              text-black placeholder-gray-600"
            />
          </div>

          {/* Photo */}
          <div>
            <label className="text-green-900 font-medium">Photo (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="mt-1"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-full mt-2 rounded-lg shadow"
              />
            )}
          </div>

          {/* Location */}
          {formData.latitude && (
            <p className="text-green-900">
              Location: {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
            </p>
          )}

          {/* Refresh Button */}
          <button
            type="button"
            onClick={refreshLocation}
            className="w-full bg-green-300 text-green-900 py-2 rounded-lg 
            font-semibold hover:bg-green-400 transition"
          >
            Confirm / Update Location
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-800 text-white py-3 rounded-lg 
            font-bold hover:bg-green-600 transition"
          >
            Submit Complaint
          </button>

        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;
