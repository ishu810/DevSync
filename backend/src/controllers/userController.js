import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import bcrypt from "bcryptjs";
console.log(">>>>> USER CONTROLLER LOADED <<<<<");

export const getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff',tenantId:req.user.tenantId, }).select('_id username email');
    res.status(200).json(staff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching staff' });
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
    // 1️⃣ Total complaints for the tenant
    const total = await Complaint.countDocuments(filter);

    // 2️⃣ Status counts
    const open = await Complaint.countDocuments({...filter, status: "OPEN" });
    const inProgress = await Complaint.countDocuments({ ...filter,status: "IN_PROGRESS" });
    const closed = await Complaint.countDocuments({...filter,status: "CLOSED" });
    const resolved = await Complaint.countDocuments({...filter, status: "RESOLVED" });

    // 3️⃣ SLA Violations (example : older than 3 days and not resolved)
    const slaViolations = await Complaint.countDocuments({
      ...filter,
      status: { $nin: ["RESOLVED", "CLOSED"] },
      updatedAt: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
    });

    // 4️⃣ Complaints grouped by category (department)
    const byCategory = await Complaint.aggregate([
      {$match:filter},
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    // 5️⃣ Complaints per engineer
    const byEngineer = await Complaint.aggregate([
      { $match: { ...filter,assigned_to: { $ne: null } } },
      { $group: { _id: "$assigned_to", count: { $sum: 1 } } }
    ]);

    // 6️⃣ Trend (last 7 days)
    const dailyTrend = await Complaint.aggregate([
       {$match:filter},
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      total,
      open,
      inProgress,
      closed,
      resolved,
      slaViolations,
      byCategory,
      byEngineer,
      dailyTrend
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
