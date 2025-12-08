import express from 'express';
import multer from 'multer';
import storage from '../Configs/cloudinary.js';
import { protect, authorizeRoles } from '../middlewares/auth.js';
import Complaint from '../models/Complaint.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

import {
  submitComplaint,
  getComplaints,
  assignComplaint,
  updateComplaintStatus,


} from '../controllers/complaintController.js';

const router = express.Router();
const upload = multer({ storage });





// router.post('/', protect, upload.single('photo'), submitComplaint);
router.post(
  '/',
  protect,
  rateLimiter("submit_complaint", 3, 60),  // 10 complaints per minute
  upload.single('photo'),
  submitComplaint
);

router.get('/', protect, getComplaints);



router.patch('/assign', protect, authorizeRoles('admin'), assignComplaint);


router.patch('/status', protect, authorizeRoles('staff', 'admin'), updateComplaintStatus);

router.post('/:id/rate', async (req, res) => {
  const { rating } = req.body;
  const complaintId = req.params.id;
  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    complaint.rating = rating;
    await complaint.save();
    res.json({ message: 'Rating saved', complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get('/hi',async(req,res)=>{
    console.log("HI");
})

export default router;

