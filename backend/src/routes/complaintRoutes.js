import express from 'express';
import multer from 'multer';
import storage from '../Configs/cloudinary.js';
import { protect, authorizeRoles } from '../middlewares/auth.js';
import {
  submitComplaint,
  getComplaints,
  assignComplaint,
  updateComplaintStatus,
  assignBulkComplaints

} from '../controllers/complaintController.js';
import { deleteComplaint } from "../controllers/complaintController.js";
import { updateComplaint } from "../controllers/complaintController.js";
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

router.patch(
  "/assign-bulk",
  protect,
  authorizeRoles("admin"),
  assignBulkComplaints
);
router.patch("/:id",protect,authorizeRoles("citizen"),upload.single("photo"),updateComplaint);
router.delete("/:id",protect,authorizeRoles("citizen"),deleteComplaint)
router.patch("/staff/bulk-update")
export default router;

