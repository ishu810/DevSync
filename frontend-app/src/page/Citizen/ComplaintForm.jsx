
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
  const [locationError, setLocationError] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 0 // Don't use cached position
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData((prev) => ({ ...prev, latitude, longitude }));
        setLocationError(null);
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = "Unable to get your location. ";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Location access was denied. Please click the button again and allow location access when prompted, or enable it in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out. Please try again.";
            break;
          default:
            errorMessage += "An unknown error occurred.";
            break;
        }
        
        setLocationError(errorMessage);
      },
      options
    );
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
    }
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
    getCurrentLocation();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.latitude || !formData.longitude) {
      alert("Location is required. Please click 'Confirm / Update Location' to get your current location.");
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
    <div className="min-h-screen overflow-y-auto flex justify-center items-start p-4 font-poppins bg-gray-100">
      <div className="bg-white rounded-xl p-8 shadow-2xl w-full max-w-md max-h-screen overflow-y-auto">
        <h2 className="text-center text-2xl font-semibold text-green-900 mb-6">
          Submit a Complaint
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-green-900 font-medium">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Complaint Title"
              required
              className="w-full p-3 border border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-black"
            />
          </div>

          <div>
            <label className="text-green-900 font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
              placeholder="Complaint Description"
              className="w-full p-3 border border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-black"
            />
          </div>

          <div>
            <label className="text-green-900 font-medium">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 border border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-black"
            >
              <option>Infrastructure</option>
              <option>Sanitation</option>
              <option>Water</option>
              <option>Electricity</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="text-green-900 font-medium">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full p-3 border border-green-700 rounded-lg text-black"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          {/*******************/}
          <div>
            <label className="text-green-900 font-medium">Address (optional)</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Your Address"
              className="w-full p-3 border border-green-700 rounded-lg text-black"
            />
          </div>

          {/* ************** */}
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
                className="w-full mt-2 rounded-lg shadow max-h-60 object-cover"
              />
            )}
          </div>

          {/* *************/}
          {formData.latitude && (
            <p className="text-green-900">
              Location: {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
            </p>
          )}

          {/* *********** */}
          <button
            type="button"
            onClick={refreshLocation}
            disabled={isGettingLocation}
            className={`w-full py-2 rounded-lg font-semibold transition ${
              isGettingLocation
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-300 text-green-900 hover:bg-green-400"
            }`}
          >
            {isGettingLocation 
              ? "Getting Location..." 
              : formData.latitude && formData.longitude
              ? "Update Location"
              : "Allow Location Access"}
          </button>

          {/* ************ */}
          <button
            type="submit"
            className="w-full bg-green-800 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition"
          >
            Submit Complaint
          </button>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;