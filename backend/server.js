import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './src/Configs/db.js';

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

// Mount routes ONLY ONCE
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/users', userRoutes);
app.post("/api/v1/save-token",saveNotificationToken)




// app.use('/api/hi',(req,res)=>{
//   res.send('hi')
// })

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
