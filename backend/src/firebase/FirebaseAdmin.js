import admin from "firebase-admin";
import dotenv from "dotenv";
import User from "../models/User.js"; 
dotenv.config();

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;



if (!projectId || !clientEmail || !privateKey) {
  console.error("Firebase environment variables missing.");
  throw new Error("Missing Firebase admin credentials environment variables");
}

privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
const serviceAccount = {
  project_id: projectId,
  client_email: clientEmail,
  private_key: privateKey,
}; 
admin.initializeApp({
 
  credential: admin.credential.cert(serviceAccount),
});
console.log(admin.credential);


// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

const saveNotificationToken = async (req, res, next) => {
  try {
    console.log("in save notification controller function")
    const { fcmToken, userId } = req.body;
    if (!fcmToken || !userId) {
      return res.status(400).json({ message: "FCM token and User ID are required." });
    }

    const user = await User.findById(userId);
    if (user) {
      user.fcmToken = fcmToken;
      await user.save();
      res.status(200).json({ message: "FCM token saved successfully." });
    console.log("Tkone generated",fcmToken,"User ID",userId);
    } else {
      res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    console.error("Error saving notification token:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export {saveNotificationToken};

export default admin;

