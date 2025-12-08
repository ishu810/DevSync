import express from 'express';
import { protect, authorizeRoles } from '../middlewares/auth.js';
import { getAllStaff,getStats, getUserById } from '../controllers/userController.js';
import { getStaffStats } from '../controllers/userController.js';
import { getAdminStats } from '../controllers/userController.js';
import { adminCreateUser } from '../controllers/userController.js';
// import { hi } from '../controllers/userController.js';
console.log("userroutes")
const router = express.Router();

router.get('/staff', protect, authorizeRoles('admin'), getAllStaff);
router.get("/dashboard/stats", protect, getStats);
router.get("/stats",protect,getStaffStats);
router.get("/admin/stats", protect,getAdminStats);
router.get("/:userId", getUserById);
// router.get("/hi",hi)
router.post("/", protect, authorizeRoles("admin"), adminCreateUser);


export default router;