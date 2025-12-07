import User from '../models/User.js';
import Complaint from '../models/Complaint.js';

export const getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' }).select('_id username email');
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
    const total=await Complaint.countDocuments({submitted_by:userId})
    const open=await Complaint.countDocuments({submitted_by:userId,status:'OPEN'});
     const closed=await Complaint.countDocuments({submitted_by:userId,status:'CLOSED'});
     const resolved=await Complaint.countDocuments({submitted_by:userId,status:'RESOLVED'})
      const inprogress=await Complaint.countDocuments({submitted_by:userId,status:'IN_PROGRESS'})
       const lastComplaint = await Complaint.findOne({ submitted_by: userId })
      .sort({ updatedAt: -1 })
      .select("status title updatedAt");
      res.status(200).json({total,open,closed,resolved,inprogress,lastComplaintStatus:lastComplaint.status||null})
  }
  catch(err){
    console.log(err)
    res.status(500).json({ message: 'Server error fetching data' });
  }

};
export const getAdminStats = async (req, res) => {
 try {

    const total = await Complaint.countDocuments({});

    const open = await Complaint.countDocuments({ status: "OPEN" });
    const inProgress = await Complaint.countDocuments({ status: "IN_PROGRESS" });
    const closed = await Complaint.countDocuments({ status: "CLOSED" });
    const resolved = await Complaint.countDocuments({ status: "RESOLVED" });

    const slaViolations = await Complaint.countDocuments({
      status: { $nin: ["RESOLVED", "CLOSED"] },
      updatedAt: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
    });

    const byCategory = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const byEngineer = await Complaint.aggregate([
      { $match: { assigned_to: { $ne: null } } },
      { $group: { _id: "$assigned_to", count: { $sum: 1 } } }
    ]);

    const dailyTrend = await Complaint.aggregate([
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

    const total = await Complaint.countDocuments({ assigned_to: staffId });
    const open = await Complaint.countDocuments({
      assigned_to: staffId,
      status: "OPEN"
    });

    const assigned = await Complaint.countDocuments({
      assigned_to: staffId,
      status: "ASSIGNED"
    });

    const inProgress = await Complaint.countDocuments({
      assigned_to: staffId,
      status: "IN_PROGRESS"
    });

    const resolved = await Complaint.countDocuments({
      assigned_to: staffId,
      status: "RESOLVED"
    });

    const closed = await Complaint.countDocuments({
      assigned_to: staffId,
      status: "CLOSED"
    });

    const slaViolations = await Complaint.countDocuments({
      assigned_to: staffId,
      status: { $nin: ["RESOLVED", "CLOSED"] },
      updatedAt: { $lt: new Date(Date.now() - 48 * 60 * 60 * 1000) }
    });

    const latest = await Complaint.findOne({ assigned_to: staffId })
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
      latest
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

// export const hi = async (req, res) => {
//   console.log("hi");
//   res.send("hi");
// };
