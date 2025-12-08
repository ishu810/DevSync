import { Worker } from "bullmq";
import User from "../models/User.js";
import { sendNotification, sendEmail } from "../firebase/SendNotification.js";

export const worker = new Worker(
  "task-queue",
  async (job) => {
    console.log("Worker processing:", job.name, job.data);

   
    if (job.name === "sendNotification") {
      const { userId, message } = job.data;

      const user = await User.findById(userId);
      if (!user) return console.log("User not found");

      if (user.fcmToken) {
        await sendNotification(user.fcmToken, "New Complaint Assigned", message);
      }

      if (user.email) {
        const subject = "New Complaint Assigned";
        const html = `
          <h2>New Complaint Assigned</h2>
          <p>${message}</p>
        `;
        await sendEmail(user.email, subject, message, html);
      }
    }
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  }
);

console.log("Worker Started...");