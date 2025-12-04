import express from 'express';
import multer from 'multer';
import storage from '../Configs/cloudinary.js';
import { protect, authorizeRoles } from '../middlewares/auth.js';
import {
  submitComplaint,
  getComplaints,
  assignComplaint,
  updateComplaintStatus,


} from '../controllers/complaintController.js';

const router = express.Router();
const upload = multer({ storage });





// Submit a complaint (any logged-in user for now)
router.post('/', protect, upload.single('photo'), submitComplaint);

// Get complaints (citizen: own, staff: assigned, admin: all)
router.get('/', protect, getComplaints);



// Assign complaint to staff
router.patch('/assign', protect, authorizeRoles('admin'), assignComplaint);

// Update complaint status (staff or admin)

router.patch('/status', protect, authorizeRoles('staff', 'admin'), updateComplaintStatus);


export default router;

