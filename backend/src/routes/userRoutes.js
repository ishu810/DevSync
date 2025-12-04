import express from 'express';
import { protect, authorizeRoles } from '../middlewares/auth.js';
import { getAllStaff } from '../controllers/userController.js';

const router = express.Router();

// Route to get all staff users (admin only)
router.get('/staff', protect, authorizeRoles('admin'), getAllStaff);

export default router;