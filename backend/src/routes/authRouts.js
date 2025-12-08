import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middlewares/auth.js';
import { rateLimiter } from "../middlewares/rateLimiter.js";


const router = express.Router();

router.post('/register', registerUser);

router.post('/login', rateLimiter("login_attempts", 5, 30), loginUser);




export default router;

