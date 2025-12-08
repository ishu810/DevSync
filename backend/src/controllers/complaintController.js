// import dotenv from "dotenv";
// dotenv.config();

// import { taskQueue } from "../queues/queue.js";
// import Complaint from "../models/Complaint.js";
// import User from "../models/User.js";

// import { sendNotification, sendEmail } from "../firebase/SendNotification.js";
// // Correct Redis client import
// import redisClient from "../Configs/redisClient.js";

// export const rateStaff = async (req, res) => {
//   try {
//     const { staffId, ratingValue, raterId } = req.body;

//     const user = await User.findById(staffId);
//     if (!user) return res.status(404).json({ message: "Staff not found" });

//     user.ratings.push({
//       rater: raterId,
//       rating: ratingValue,
//       date: new Date(),
//     });

//     await user.save();

//     await redisClient.del(`staff_ratings_${user.tenantId}`);

//     console.log("♻️ Redis cache cleared → staff ratings");

//     return res.json({ message: "Rating saved", ratings: user.ratings });
//   } catch (err) {
//     console.error("Rate staff error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };


// export const submitComplaint = async (req, res) => {
//   try {
//     if (!req.user?.id) {
//       return res.status(401).json({ success: false, message: "Not authenticated" });
//     }

//     if (req.user.role !== "citizen") {
//       return res
//         .status(403)
//         .json({ success: false, message: "Only citizens can submit complaints" });
//     }

//     const { title, description, category, priority, latitude, longitude, address } = req.body;

//     if (!title?.trim() || !description?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Title and description are required",
//       });
//     }

//     const photo_url = req.file?.path || "";

//     const complaint = await Complaint.create({
//       tenantId: req.user.tenantId,
//       submitted_by: req.user.id,
//       title: title.trim(),
//       description: description.trim(),
//       category: category || "Other",
//       priority: priority || "Low",
//       photo_url,
//       location: {
//         latitude: latitude ? Number(latitude) : undefined,
//         longitude: longitude ? Number(longitude) : undefined,
//         address: address?.trim() || "",
//       },
//     });

//     // Clear Redis cache (admin + citizen complaint list)
//     await redisClient.del(`complaints:${req.user.tenantId}:citizen:${req.user.id}`);
//     await redisClient.del(`complaints:${req.user.tenantId}:admin`);
//     await redisClient.del(`admin_stats_${req.user.tenantId}`);

//     console.log("Redis cache cleared → complaint created");

//     res.status(201).json({
//       success: true,
//       message: "Complaint submitted successfully",
//       complaint,
//     });
//   } catch (error) {
//     console.error("Submit complaint error:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

// export const getComplaints = async (req, res) => {
//   try {
//     if (!req.user?.id) {
//       return res.status(401).json({
//         success: false,
//         message: "User not authenticated",
//       });
//     }

//     const tenantId = req.user.tenantId;
//     const filter = { tenantId };

//     // Role-based filtering
//     if (req.user.role === "citizen") filter.submitted_by = req.user.id;
//     if (req.user.role === "staff") filter.assigned_to = req.user.id;

//     // Redis cache key
//     const cacheKey = `complaints:${tenantId}:${req.user.role}:${req.user.id || "admin"}`;

//     // first to Redis cache
//     const cached = await redisClient.get(cacheKey);
//     if (cached) {
//       console.log("Complaints served from Redis Cache");
//       return res.status(200).json(JSON.parse(cached));
//     }

//     // Fetch from Mongo
//     const complaints = await Complaint.find(filter)
//       .populate("submitted_by", "username email")
//       .populate("assigned_to", "username email ratings")
//       .sort({ createdAt: -1 });

//     // Save in Redis
//     await redisClient.setEx(cacheKey, 30, JSON.stringify(complaints));

//     console.log("Complaints cached for 30s");

//     return res.status(200).json(complaints);
//   } catch (error) {
//     console.error("Get complaints error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching complaints",
//     });
//   }
// };


// export const assignComplaint = async (req, res) => {
//   try {
//     const { complaintId, staffId } = req.body;

//     if (req.user.role !== "admin") {
//       return res.status(403).json({ success: false, message: "Access denied" });
//     }

//     // Validate staff
//     const staff = await User.findOne({
//       _id: staffId,
//       role: "staff",
//       tenantId: req.user.tenantId,
//     });

//     if (!staff) {
//       return res.status(400).json({ success: false, message: "Invalid staff for this tenant" });
//     }

//     const complaint = await Complaint.findOneAndUpdate(
//       { _id: complaintId, tenantId: req.user.tenantId },
//       {
//         assigned_to: staffId,
//         status: "ASSIGNED",
//         updatedAt: Date.now(),
//       },
//       { new: true }
//     )
//       .populate("assigned_to", "username email fcmToken")
//       .populate("submitted_by", "username email");

//     if (!complaint) {
//       return res.status(404).json({ success: false, message: "Complaint not found" });
//     }

//     // NOTIFICATION SYSTEM (Firebase + Email)
//     if (complaint.assigned_to?.fcmToken) {
//       await sendNotification(
//         complaint.assigned_to.fcmToken,
//         `New Complaint Assigned`,
//         `Complaint titled "${complaint.title}" has been assigned to you.`
//       );
//     }

//     if (complaint.assigned_to.email) {
//       await sendEmail(
//         complaint.assigned_to.email,
//         "New Complaint Assigned",
//         `A new complaint titled "${complaint.title}" has been assigned to you.`,
//         `<h2>New Complaint Assigned</h2><p>Please check your dashboard.</p>`
//       );
//     }

//     // Invalidate Redis Cache
//     await redisClient.del(`complaints:${req.user.tenantId}:admin`);
//     await redisClient.del(`complaints:${req.user.tenantId}:staff:${staffId}`);
//     await redisClient.del(`admin_stats_${req.user.tenantId}`);

//     console.log("Cache cleared → complaint assigned");

//     // Background job queue
//     await taskQueue.add("sendNotification", {
//       userId: staffId,
//       message: "A new complaint has been assigned to you!",
//     });

//     res.status(200).json({
//       success: true,
//       message: "Complaint assigned successfully",
//       complaint,
//     });
//   } catch (error) {
//     console.error("Assign complaint error:", error);
//     res.status(500).json({ success: false, message: "Error assigning complaint" });
//   }
// };


// export const updateComplaintStatus = async (req, res) => {
//   try {
//     const { complaintId, status, remarks } = req.body;

//     const validStatuses = ["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({ success: false, message: "Invalid status value" });
//     }

//     const complaint = await Complaint.findOne({
//       _id: complaintId,
//       tenantId: req.user.tenantId,
//     });

//     if (!complaint) {
//       return res.status(404).json({ success: false, message: "Complaint not found" });
//     }

//     if (req.user.role === "staff" && String(complaint.assigned_to) !== req.user.id) {
//       return res.status(403).json({ success: false, message: "Not your complaint" });
//     }

//     complaint.status = status;
//     complaint.remarks = remarks ?? complaint.remarks;
//     complaint.updatedAt = Date.now();

//     await complaint.save();

//     // Cache invalidation
//     await redisClient.del(`complaints:${req.user.tenantId}:admin`);
//     await redisClient.del(`complaints:${req.user.tenantId}:staff:${complaint.assigned_to}`);
//     await redisClient.del(`admin_stats_${req.user.tenantId}`);

//     console.log("Redis cache cleared");

//     res.status(200).json({
//       success: true,
//       message: "Status updated successfully",
//       complaint,
//     });
//   } catch (error) {
//     console.error("Update complaint error:", error);
//     res.status(500).json({ success: false, message: "Error updating status" });
//   }
// };


import dotenv from "dotenv";
dotenv.config();

import { taskQueue } from "../queues/queue.js";
import Complaint from "../models/Complaint.js";
import User from "../models/User.js";

import redisClient from "../Configs/redisClient.js";

// -------------------------------------------------
export const rateStaff = async (req, res) => {
  try {
    const { staffId, ratingValue, raterId } = req.body;

    const user = await User.findById(staffId);
    if (!user) return res.status(404).json({ message: "Staff not found" });

    user.ratings.push({
      rater: raterId,
      rating: ratingValue,
      date: new Date(),
    });

    await user.save();

    await redisClient.del(`staff_ratings_${user.tenantId}`);
    console.log("♻️ Redis cache cleared → staff ratings");

    return res.json({ message: "Rating saved", ratings: user.ratings });
  } catch (err) {
    console.error("Rate staff error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// -------------------------------------------------
export const submitComplaint = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    if (req.user.role !== "citizen") {
      return res.status(403).json({
        success: false,
        message: "Only citizens can submit complaints",
      });
    }

    const { title, description, category, priority, latitude, longitude, address } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const photo_url = req.file?.path || "";

    const complaint = await Complaint.create({
      tenantId: req.user.tenantId,
      submitted_by: req.user.id,
      title: title.trim(),
      description: description.trim(),
      category: category || "Other",
      priority: priority || "Low",
      photo_url,
      location: {
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        address: address?.trim() || "",
      },
    });

    // Clear Redis cache
    await redisClient.del(`complaints:${req.user.tenantId}:citizen:${req.user.id}`);
    await redisClient.del(`complaints:${req.user.tenantId}:admin`);
    await redisClient.del(`admin_stats_${req.user.tenantId}`);

    console.log("Redis cache cleared → complaint created");

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      complaint,
    });
  } catch (error) {
    console.error("Submit complaint error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// -------------------------------------------------
export const getComplaints = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const tenantId = req.user.tenantId;
    const filter = { tenantId };

    if (req.user.role === "citizen") filter.submitted_by = req.user.id;
    if (req.user.role === "staff") filter.assigned_to = req.user.id;

    const cacheKey = `complaints:${tenantId}:${req.user.role}:${req.user.id || "admin"}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log("Complaints served from Redis Cache");
      return res.status(200).json(JSON.parse(cached));
    }

    const complaints = await Complaint.find(filter)
      .populate("submitted_by", "username email")
      .populate("assigned_to", "username email ratings")
      .sort({ createdAt: -1 });

    await redisClient.setEx(cacheKey, 30, JSON.stringify(complaints));

    console.log("Complaints cached for 30s");

    return res.status(200).json(complaints);
  } catch (error) {
    console.error("Get complaints error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching complaints",
    });
  }
};

// -------------------------------------------------
export const assignComplaint = async (req, res) => {
  try {
    const { complaintId, staffId } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const staff = await User.findOne({
      _id: staffId,
      role: "staff",
      tenantId: req.user.tenantId,
    });

    if (!staff) {
      return res.status(400).json({ success: false, message: "Invalid staff for this tenant" });
    }

    const complaint = await Complaint.findOneAndUpdate(
      { _id: complaintId, tenantId: req.user.tenantId },
      {
        assigned_to: staffId,
        status: "ASSIGNED",
        updatedAt: Date.now(),
      },
      { new: true }
    )
      .populate("assigned_to", "username email fcmToken")
      .populate("submitted_by", "username email");

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    // -----------noti via queue------------------
    console.log("for assing complent que notification",staffId,complaint.title,complaint._id,"done")
    await taskQueue.add("complaintAssigned", {
      userId: staffId,
      complaintTitle: complaint.title,
      
    });

    console.log("Job queued → complaintAssigned");

    // CACHE INVALIDATION
    await redisClient.del(`complaints:${req.user.tenantId}:admin`);
    await redisClient.del(`complaints:${req.user.tenantId}:staff:${staffId}`);
    await redisClient.del(`admin_stats_${req.user.tenantId}`);

    res.status(200).json({
      success: true,
      message: "Complaint assigned successfully",
      complaint,
    });
  } catch (error) {
    console.error("Assign complaint error:", error);
    res.status(500).json({ success: false, message: "Error assigning complaint" });
  }
};

// -------------------------------------------------
export const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId, status, remarks } = req.body;

    const validStatuses = ["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const complaint = await Complaint.findOne({
      _id: complaintId,
      tenantId: req.user.tenantId,
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    if (req.user.role === "staff" && String(complaint.assigned_to) !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not your complaint" });
    }

    complaint.status = status;
    complaint.remarks = remarks ?? complaint.remarks;
    complaint.updatedAt = Date.now();

    await complaint.save();

    // CACHE INVALIDATION
    await redisClient.del(`complaints:${req.user.tenantId}:admin`);
    await redisClient.del(`complaints:${req.user.tenantId}:staff:${complaint.assigned_to}`);
    await redisClient.del(`admin_stats_${req.user.tenantId}`);

    console.log("♻️ Redis cache cleared → complaint updated");

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      complaint,
    });
  } catch (error) {
    console.error("Update complaint error:", error);
    res.status(500).json({ success: false, message: "Error updating status" });
  }
};

