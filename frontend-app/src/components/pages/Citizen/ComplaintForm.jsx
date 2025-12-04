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
      (err) => alert("Please enable location access.")
    );
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, photo: file });
    setPreview(URL.createObjectURL(file));
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
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-violetDark to-violetMid p-4 font-poppins">
      <div className="bg-white rounded-xl p-8 shadow-2xl w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold text-violetDark mb-6">
          Submit a Complaint
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title */}
          <div>
            <label className="text-violetDark font-medium">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Complaint Title"
              required
              className="w-full p-3 border border-violetDark rounded-lg focus:ring-2 focus:ring-violetMid outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-violetDark font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
              placeholder="Complaint Description"
              className="w-full p-3 border border-violetDark rounded-lg focus:ring-2 focus:ring-violetMid outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-violetDark font-medium">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 border border-violetDark rounded-lg focus:ring-2 focus:ring-violetMid outline-none"
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
            <label className="text-violetDark font-medium">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full p-3 border border-violetDark rounded-lg"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="text-violetDark font-medium">Address (optional)</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Your Address"
              className="w-full p-3 border border-violetDark rounded-lg"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="text-violetDark font-medium">Photo (optional)</label>
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
            <p className="text-violetDark">
              Location: {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
            </p>
          )}

          {/* Refresh Location Button */}
          <button
            type="button"
            onClick={refreshLocation}
            className="w-full bg-gold text-violetDark py-2 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Confirm / Update Location
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-violetDark text-white py-3 rounded-lg font-bold hover:bg-violetMid transition"
          >
            Submit Complaint
          </button>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;
