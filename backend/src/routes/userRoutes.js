import express from 'express';
import { protect, authorizeRoles } from '../middlewares/auth.js';
import { getAllStaff, getAdminStats } from '../controllers/userController.js';

const router = express.Router();

// Route to get all staff users (admin only)
router.get('/staff', protect, authorizeRoles('admin'), getAllStaff);

// Route to get admin statistics (admin only)
router.get('/admin/stats', protect, authorizeRoles('admin'), getAdminStats);

export default router;