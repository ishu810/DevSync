import express from 'express';
import { protect, authorizeRoles } from '../middlewares/auth.js';
import { getAllStaff,getStats } from '../controllers/userController.js';
import { getStaffStats } from '../controllers/userController.js';
import { getAdminStats } from '../controllers/userController.js';
// import { hi } from '../controllers/userController.js';
console.log("userroutes")
const router = express.Router();

// Route to get all staff users (admin only)
router.get('/staff', protect, authorizeRoles('admin'), getAllStaff);
router.get("/dashboard/stats", protect, getStats);
router.get("/stats",protect,getStaffStats);
router.get("/admin/stats", protect,getAdminStats);
// router.get("/hi",hi)
export default router;