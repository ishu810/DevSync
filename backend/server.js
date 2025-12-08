import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './src/Configs/db.js';
import { protect, authorizeRoles } from './src/middlewares/auth.js';
import User from './src/models/User.js';


connectDB();

import authRoutes from './src/routes/authRouts.js';
import complaintRoutes from './src/routes/complaintRoutes.js';
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import userRoutes from './src/routes/userRoutes.js';
import {saveNotificationToken} from "./src/firebase/FirebaseAdmin.js"
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
console.log(">>> THIS SERVER FILE IS RUNNING:", __filename);
console.log(">>> WORKING DIRECTORY:", process.cwd());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"]
}));


app.get('/', (req, res) => {
  res.send('Server is working');
});

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/users', userRoutes);
app.post("/api/v1/save-token",saveNotificationToken)
// app.post("/api/complaint/",async(req,res)=>{
    
// })
app.post('/api/users/:id/rate', protect, async (req, res) => {
  const staffId = req.params.id;
  const raterId = req.user._id; 
  const { rating } = req.body;
  console.log(rating);
  console.log("staffid",staffId)
  console.log("userid",raterId)
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Invalid rating value' });
  }

  try {
    const staff = await User.findById(staffId);
    console.log("finding staff in rating route")
    if (!staff) {
      return res.status(404).json({ message: 'Staff user not found' });
    }
   console.log("staff found");
    staff.ratings.push({ rater: raterId, rating, date: new Date() });
    console.log("rating pushed");
    await staff.save();
    console.log("rating saved");
    return res.status(200).json({ message: 'Rating saved', ratings: staff.ratings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// export default router;


// app.use('/api/hi',(req,res)=>{
//   res.send('hi')
// })

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
