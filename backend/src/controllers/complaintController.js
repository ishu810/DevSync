import dotenv from "dotenv";
dotenv.config();
import Complaint from '../models/Complaint.js';
import { sendNotification, sendEmail } from '../firebase/SendNotification.js';
import User  from '../models/User.js';


export const rateStaff = async (req, res) => {
  try {
    const { staffId, ratingValue, raterId } = req.body; 
    const user = await User.findById(staffId);
    if (!user) return res.status(404).json({ message: "Staff not found" });

    user.ratings.push({
      rater: raterId,
      rating: ratingValue,
      date: new Date()
    });

    await user.save();
    return res.json({ message: "Rating saved", ratings: user.ratings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


export const submitComplaint = async (req, res) => {2
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    if (!'citizen'.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only citizens can submit complaints' });
    }

    const {
      title = '',
      description = '',
      category = 'Other',
      priority = 'Low',
      latitude,
      longitude,
      address = '',
    } = req.body;

    if (!title.trim() || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    // Optional photo
    const photo_url = req.file?.path || '';

    const complaintData = {
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
    };

    const complaint = await Complaint.create(complaintData);

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint,
    });

  } catch (error) {
    console.error('Error submitting complaint:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};


export const getComplaints = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    let filter = {};
    if (req.user.role === 'citizen') filter.submitted_by = req.user.id;
    if (req.user.role === 'staff') filter.assigned_to = req.user.id;

    const complaints = await Complaint.find(filter)
      .populate('submitted_by', 'username email')
      .populate('assigned_to', 'username email ratings')
      .sort({ createdAt: -1 });
    
    return res.status(200).json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error.stack);
    return res.status(500).json({ success: false, message: 'Error fetching complaints', error: error.message });
  }
};


export const assignComplaint = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { complaintId, staffId } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { assigned_to: staffId, status: 'ASSIGNED', updatedAt: Date.now() },
      { new: true }
    )
      .populate('assigned_to', 'username email fcmToken')
       // populate Token
      .populate('submitted_by', 'username email');

    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    // Send immediate notification to assigned staff
    if (complaint.assigned_to) {
      const staffUser = complaint.assigned_to;
      const title = `New Complaint Assigned: ${complaint.title}`;
      const body = `Complaint #${complaint._id} has been assigned to you. Type: ${complaint.category}. Location: ${complaint.location?.address || 'N/A'}. Deadline: ${complaint.deadline ? new Date(complaint.deadline).toLocaleString() : 'N/A'}`;

      if (staffUser.fcmToken) {
        console.log("in background messaging");
        console.log("Private key starts with:", process.env.FIREBASE_PRIVATE_KEY.slice(0, 40));
        console.log("Private key ends with:", process.env.FIREBASE_PRIVATE_KEY.slice(-40));

        await sendNotification(staffUser.fcmToken, title, body);
        console.log("background messaging done");
      }
      if (staffUser.email) {
        const html = `
          <div style="font-family: Arial, sans-serif; padding: 15px;">
            <h2> New Complaint Assigned!</h2>
            <p>Hi ${staffUser.username || "there"},</p>
            <p>A new complaint has been assigned to you:</p>
            <h3>${complaint.title}</h3>
            <p><strong>Description:</strong> ${complaint.description}</p>
            <p><strong>Category:</strong> ${complaint.category}</p>
            <p><strong>Location:</strong> ${complaint.location?.address || 'N/A'}</p>
            <p><strong>Priority:</strong> ${complaint.priority}</p>
            <p><strong>Deadline:</strong> ${complaint.deadline ? new Date(complaint.deadline).toLocaleString() : 'N/A'}</p>
            <br/>
            <p>Please review and take action.<br/>– DevSync Team</p>
          </div>
        `;
        await sendEmail(staffUser.email, title, body, html);
        console.log("email sent");
      }
    }

    return res.status(200).json({ success: true, message: 'Complaint assigned successfully', complaint });
  } catch (error) {
    console.error('Error assigning complaint:', error.stack);
    return res.status(500).json({ success: false, message: 'Error assigning complaint', error: error.message });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId, status, remarks } = req.body;
    const validStatuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    if (req.user.role === 'staff' && status === 'ASSIGNED') {
      return res.status(400).json({ success: false, message: 'Staff cannot reassign complaint' });
    }

    complaint.status = status;
    complaint.remarks = remarks || complaint.remarks;
    complaint.updatedAt = Date.now();
    await complaint.save();

    return res.status(200).json({ success: true, message: 'Status updated successfully', complaint });
  } catch (error) {
    console.error('Error updating complaint status:', error.stack);
    return res.status(500).json({ success: false, message: 'Error updating status', error: error.message });
  }
};


