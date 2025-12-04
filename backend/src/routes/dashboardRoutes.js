import express from "express";
import { protect, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

// Citizen dashboard
import User from "../models/User.js";

router.get("/citizen", protect, authorizeRoles("citizen"), async (req, res) => {
  const user = await User.findById(req.user.id).select("username role");
  if (!user) return res.status(404).json({ msg: "User not found" });

  res.json({
    success: true,
    role: user.role,
    msg: `Welcome citizen ${user.username}`,
  });
});


// Staff dashboard
router.get("/staff", protect, authorizeRoles("staff", "admin"), (req, res) => {
  res.json({
    success: true,
    role: "staff",
    msg: `Welcome staff ${req.user.username}`,
  });
});

// Admin dashboard
router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
  res.json({
    success: true,
    role: "admin",
    msg: `Welcome admin ${req.user.username}`,
  });
});

export default router;
