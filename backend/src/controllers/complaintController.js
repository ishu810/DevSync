import Complaint from "../models/Complaint.js";
import { sendNotification, sendEmail } from "../firebase/SendNotification.js";
import User from "../models/User.js";

/* ===========================
   SUBMIT COMPLAINT (CITIZEN)
=========================== */
export const submitComplaint = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (req.user.role !== "citizen") {
      return res.status(403).json({
        success: false,
        message: "Only citizens can submit complaints",
      });
    }

    const {
      title = "",
      description = "",
      category = "Other",
      priority = "Low",
      latitude,
      longitude,
      address = "",
    } = req.body;

    if (!title.trim() || !description.trim()) {
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
      category,
      priority,
      photo_url,
      location: {
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        address: address.trim(),
      },
    });

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      complaint,
    });
  } catch (error) {
    console.error("Error submitting complaint:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* ===========================
   GET COMPLAINTS (ALL ROLES)
=========================== */
export const getComplaints = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const filter = { tenantId: req.user.tenantId };

    if (req.user.role === "citizen") {
      filter.submitted_by = req.user.id;
    } else if (req.user.role === "staff") {
      filter.assigned_to = req.user.id;
    }

    const complaints = await Complaint.find(filter)
      .populate("submitted_by", "username email")
      .populate("assigned_to", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching complaints",
    });
  }
};

/* ===========================
   ASSIGN COMPLAINT (ADMIN)
=========================== */
export const assignComplaint = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const { complaintId, staffId } = req.body;

    // ✅ Ensure staff belongs to same tenant
    const staffUser = await User.findOne({
      _id: staffId,
      role: "staff",
      tenantId: req.user.tenantId,
    });

    if (!staffUser) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff for this tenant",
      });
    }

    const complaint = await Complaint.findOneAndUpdate(
      {
        _id: complaintId,
        tenantId: req.user.tenantId,
      },
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
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    // ✅ Notifications
    const title = `New Complaint Assigned: ${complaint.title}`;
    const body = `Complaint ${complaint._id} assigned to you.`;

    if (staffUser.fcmToken) {
      await sendNotification(staffUser.fcmToken, title, body);
    }

    if (staffUser.email) {
      await sendEmail(staffUser.email, title, body);
    }

    res.status(200).json({
      success: true,
      message: "Complaint assigned successfully",
      complaint,
    });
  } catch (error) {
    console.error("Error assigning complaint:", error);
    res.status(500).json({
      success: false,
      message: "Error assigning complaint",
    });
  }
};

/* ===========================
   UPDATE COMPLAINT STATUS
=========================== */
export const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId, status, remarks } = req.body;

    const validStatuses = [
      "OPEN",
      "ASSIGNED",
      "IN_PROGRESS",
      "RESOLVED",
      "CLOSED",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const complaint = await Complaint.findOne({
      _id: complaintId,
      tenantId: req.user.tenantId,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    // ✅ Staff can only update their assigned complaints
    if (
      req.user.role === "staff" &&
      String(complaint.assigned_to) !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this complaint",
      });
    }

    complaint.status = status;
    complaint.remarks = remarks ?? complaint.remarks;
    complaint.updatedAt = Date.now();

    await complaint.save();

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      complaint,
    });
  } catch (error) {
    console.error("Error updating complaint status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating status",
    });
  }
  
};
export const assignBulkComplaints=async(req,res)=>{
  try {
    console.log("bulk assing")
    const{complaintIds,staffId}=req.body;
    if(!complaintIds?.length||!staffId){
      return res.status(400).json({msg:"Invalid Payload"});
    }
    console.log(complaintIds)
    const staff=await User.findOne({
      _id:staffId,
      role:"staff",
      tenantId:req.user.tenantId,
    })
    console.log(staff)
    if(!staff){
      return res.status(400).json({msg:"Invalid Staff"});

    }

    const result=await Complaint.updateMany(
      {
        _id:{$in:complaintIds},
        tenantId:req.user.tenantId,

      },
      {
        assigned_to:staffId,
        status:"ASSIGNED",
        updatedAt:Date.now(),
      }
    );
     return res.status(200).json({
      success: true,
      matched: result.matchedCount,
      updated: result.modifiedCount,
     });
     
  }catch(err){
    console.log(err);
    res.status(500).json({msg:"Bulk complaints failed"})
  }
};
export const deleteComplaint=async(req,res)=>{
  try{
    const complaint =await Complaint.findOne({
      _id:req.params.id,
      submitted_by:req.user.id,
      tenantId:req.user.tenantId,
      status:"OPEN",
    });
    if(!complaint){
      return res.status(400).json({
        msg:"Cannot delete this complaint",
      })
    }
    await complaint.deleteOne();
    res.json({success:true,msg:"Complaint deleted"});
  } catch(err){
    console.log(err);
    res.status(500).json({msg:"Delete failed"})
  }
}
export const updateComplaint = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { title, description, category, priority } = req.body;

    const complaint = await Complaint.findOne({
      _id: complaintId,
      submitted_by: req.user.id,
      tenantId: req.user.tenantId,
    });

    if (!complaint) {
      return res.status(404).json({ msg: "Complaint not found" });
    }

    if (complaint.status !== "OPEN") {
      return res.status(400).json({
        msg: "Cannot edit complaint after assignment",
      });
    }

    // ✅ Update fields only if provided
    complaint.title = title ?? complaint.title;
    complaint.description = description ?? complaint.description;
    complaint.category = category ?? complaint.category;
    complaint.priority = priority ?? complaint.priority;

    // ✅ Update photo ONLY if new file uploaded
    if (req.file?.path) {
      complaint.photo_url = req.file.path;
    }

    complaint.updatedAt = Date.now();
    await complaint.save();

    res.json({
      success: true,
      msg: "Complaint updated",
      complaint,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Update failed" });
  }
};
export const staffBulkUpdateComplaints = async(req,res)=>{
  try{
    if(req.user.role!="staff"){
      return res.status(403).json({msg:"only Staff allowed"});

    }
    const {complaintIds,status,remarks}=req.body;
    if(!complaintIds?.length||!status){
      return res.status(403).json({msg:"Invalid Payload"});
    }
    const allowedStatuses=["IN_PROGRESS","RESOLVED","CLOSED"];
    if(!allowedStatuses.includes(status)){
      return res.status(400).json({msg:"Invalid status"});
    }
    const result=await Complaint.updateMany({
      _id:{$in:complaintIds},
      assigned_to:req.user._id,
      tenantId:req.user.tenantId,

    },
    {
      $set:{
        status,
        remarks,
        updatedAt:Date.now(),
      },
    }
  

  );
  res.json({
    succes:true,
    updated:result.modifiedCount,

  });
  }catch(err){
    console.error(err);
    res.status(500).json({msg:"Bulk Update failed"});

  }
}
  