// server/server.js


import 'dotenv/config';
import express, { json } from 'express';
import cors from 'cors';
import connectDB from './src/Configs/db.js';
connectDB(); 
import { protect, authorizeRoles } from "./src/middlewares/auth.js";
import authRoutes from './src/routes/authRouts.js';
import complaintRoutes from './src/routes/complaintRoutes.js';
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import userRoutes from './src/routes/userRoutes.js';
// import saveNotificationToken from "./src/firebase/routes.js"
const app = express();



// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));// Allows parsing of JSON request bodies
app.use(cors({
  origin: ["http://localhost:5173","http://localhost:5174"]
}));       



// A simple test route
app.get('/', (req, res) => {
  res.send('Server is working');
});

// Routes 
app.use('/api/auth', authRoutes);

app.use('/api/complaints', complaintRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use('/api/users', userRoutes);



app.get('/', (req, res) => {
  res.send('Server is working');
});

// Routes 
app.use('/api/auth', authRoutes);

app.use('/api/complaints', complaintRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use('/api/users', userRoutes);
// app.use("/api/v1/save-token",saveNotificationToken)





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
