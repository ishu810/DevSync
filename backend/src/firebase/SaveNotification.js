import User from "../models/User.js"; 

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