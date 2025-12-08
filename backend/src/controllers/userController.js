import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import redisClient from "../Configs/redisClient.js";
import bcrypt from "bcryptjs";

export const getAllStaff = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    // Redis cache key (per tenant)
    const cacheKey = `staff_ratings_${tenantId}`;

    // 🔹 1. Check Redis cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log("📌 Staff ratings served from Redis");
      return res.status(200).json(JSON.parse(cached));
    }

    // 🔹 2. Fetch from MongoDB
    const staff = await User.find({ role: "staff", tenantId })
      .select("_id username email ratings");

    // 🔹 3. Convert ratings into stats
    const staffWithStats = staff.map((member) => {
      const ratings = member.ratings || [];
      const totalRatings = ratings.length;

      const averageRating =
        totalRatings > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
          : 0;

      // Star distribution
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratings.forEach((r) => {
        distribution[r.rating] += 1;
      });

      return {
        _id: member._id,
        username: member.username,
        email: member.email,
        ratings,
        totalRatings,
        averageRating: Number(averageRating.toFixed(2)),
        distribution
      };
    });

    // 🔹 4. Cache for 10 minutes (600 seconds)
    await redisClient.setEx(cacheKey, 600, JSON.stringify(staffWithStats));
    console.log("💾 Staff ratings cached in Redis");

    res.status(200).json(staffWithStats);

  } catch (err) {
    console.error("❌ Error in getAllStaff:", err);
    res.status(500).json({ message: "Server error fetching staff" });
  }
};

export const getStats=async (req,res)=>{
  console.log("stats")
  try{
    const userId=req.user.id;
    const tenantId=req.user.tenantId;
    const total=await Complaint.countDocuments({submitted_by:userId,tenantId})
    const open=await Complaint.countDocuments({submitted_by:userId,status:'OPEN',tenantId});
     const closed=await Complaint.countDocuments({submitted_by:userId,status:'CLOSED',tenantId});
     const resolved=await Complaint.countDocuments({submitted_by:userId,status:'RESOLVED',tenantId})
      const inprogress=await Complaint.countDocuments({submitted_by:userId,status:'IN_PROGRESS',tenantId})
       const lastComplaint = await Complaint.findOne({ submitted_by: userId,tenantId })
      .sort({ updatedAt: -1 })
      .select("status title updatedAt");
      res.status(200).json({total,open,closed,resolved,inprogress,lastComplaintStatus:lastComplaint?.status||null})
  }
  catch(err){
    console.log(err)
    res.status(500).json({ message: 'Server error fetching data' });
  }

};
export const getAdminStats = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const filter = { tenantId };

    // --- REDIS CACHE KEY ---
    const cacheKey = `admin_stats_${tenantId}`;

    // --- CHECK CACHE ---
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({
        cached: true,
        ...JSON.parse(cached)
      });
    }

    // --- IF NOT CACHED → RUN DB QUERIES ---
    const total = await Complaint.countDocuments(filter);

    const open = await Complaint.countDocuments({ ...filter, status: "OPEN" });
    const inProgress = await Complaint.countDocuments({ ...filter, status: "IN_PROGRESS" });
    const closed = await Complaint.countDocuments({ ...filter, status: "CLOSED" });
    const resolved = await Complaint.countDocuments({ ...filter, status: "RESOLVED" });

    const slaViolations = await Complaint.countDocuments({
      ...filter,
      status: { $nin: ["RESOLVED", "CLOSED"] },
      updatedAt: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
    });

    const byCategory = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const byEngineer = await Complaint.aggregate([
      { $match: { ...filter, assigned_to: { $ne: null } } },
      { $group: { _id: "$assigned_to", count: { $sum: 1 } } }
    ]);

    const dailyTrend = await Complaint.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const stats = {
      total,
      open,
      inProgress,
      closed,
      resolved,
      slaViolations,
      byCategory,
      byEngineer,
      dailyTrend
    };

    // --- SAVE TO REDIS FOR 5 MINUTES ---
    await redisClient.setEx(cacheKey, 300, JSON.stringify(stats));

    res.json({
      cached: false,
      ...stats
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to load admin stats" });
  }
};

export const getStaffStats = async (req, res) => {
  try {
    const staffId = req.user.id;
    const tenantId = req.user.tenantId;

    const baseFilter = {
      assigned_to: staffId,
      tenantId,
    };

    const total = await Complaint.countDocuments(baseFilter);
    const open = await Complaint.countDocuments({
      ...baseFilter,
      status: "OPEN",
    });
    const assigned = await Complaint.countDocuments({
      ...baseFilter,
      status: "ASSIGNED",
    });
    const inProgress = await Complaint.countDocuments({
      ...baseFilter,
      status: "IN_PROGRESS",
    });
    const resolved = await Complaint.countDocuments({
      ...baseFilter,
      status: "RESOLVED",
    });
    const closed = await Complaint.countDocuments({
      ...baseFilter,
      status: "CLOSED",
    });

    const slaViolations = await Complaint.countDocuments({
      ...baseFilter,
      status: { $nin: ["RESOLVED", "CLOSED"] },
      updatedAt: {
        $lt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      },
    });

    const latest = await Complaint.findOne(baseFilter)
      .sort({ updatedAt: -1 })
      .select("title status updatedAt");

    res.json({
      total,
      open,
      assigned,
      inProgress,
      resolved,
      closed,
      slaViolations,
      latest,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching staff stats" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("fcmToken"); // Only select fcmToken
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const adminCreateUser = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Forbidden" });
  }

  const { username, email, password, role } = req.body;

  if (!["staff", "citizen"].includes(role)) {
    return res.status(400).json({ msg: "Invalid role" });
  }

  const exists = await User.findOne({
    tenantId: req.user.tenantId,
    $or: [{ email }, { username }],
  });

  if (exists) {
    return res
      .status(400)
      .json({ msg: "User already exists in this tenant" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email: email.toLowerCase(),
    password: hashed,
    role,
    tenantId: req.user.tenantId,
  });

  res.status(201).json({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
  });
};
// export const hi = async (req, res) => {
//   console.log("hi");
//   res.send("hi");
// };
