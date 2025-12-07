import cron from "node-cron";
import admin from "./FirebaseAdmin.js";
// import  User  from "../models/User.js";
import User from "../models/User.js"; 

import  Complaint  from "../models/Complaint.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify()

  .then(() => console.log("Email transporter ready"))
  .catch(err => console.error("Email transporter error:", err));


async function sendEmail(to, subject, text, html) {
  // console.log("email send function")
  const mailOptions = {
    from: `"DevSync" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("email send");
  } catch (err) {
    console.error("Error sending email:", err);
  }
}


async function sendNotification(token, title, body) {
  const message = { notification: { title, body }, token };
 
  try {
    await admin.messaging().send(message);
    console.log(`Notification sent to token: ${token}`);
  } catch (err) {
    console.error("Error sending notification:", err);
  }
}

//****************crone job******************** */
const sendnoti = () => {
  cron.schedule("*/15 * * * *", async () => { 
    console.log("in cron.scedule")
    console.log("Cron triggered: Checking for reminders", new Date().toLocaleString());

    try {
      const now = new Date();

      // Complaint Deadline Alerts
      const impendingComplaints = await Complaint.find({
        status: { $nin: ['RESOLVED', 'CLOSED'] },
         // Not yet resolved or closed
        deadline: { $ne: null, $lte: new Date(now.getTime() + 60 * 60 * 1000) } 
        // Deadline is within the next hour
      }).populate('assigned_to', 'username email fcmToken');

      for (const complaint of impendingComplaints) {
        if (complaint.assigned_to) {
          const staffUser = complaint.assigned_to;
          const timeRemaining = complaint.deadline.getTime() - now.getTime();
          const minutesRemaining = Math.round(timeRemaining / (1000 * 60));

          // Only send if within 1 hour before, not repeatedly after
          if (minutesRemaining > 0 && minutesRemaining <= 60) {
            // Prevent duplicate notifications within the last hour
            if (complaint.lastDeadlineAlerted) {
              const lastAlert = new Date(complaint.lastDeadlineAlerted);
              if (now.getTime() - lastAlert.getTime() < 60 * 60 * 1000) { 
                // alerted within the last hour
                console.log(`Already alerted for complaint ${complaint._id} within the last hour.`);
                continue;
              }
            }
            const title = `IMPENDING DEADLINE: Complaint #${complaint._id}`;
            const body = `Complaint: ${complaint.title} has a deadline in ${minutesRemaining} minutes. Status: ${complaint.status}`;

            if (staffUser.fcmToken) {
              await sendNotification(staffUser.fcmToken, title, body);
            }
            if (staffUser.email) {
              const html = `
                <div style="font-family: Arial, sans-serif; padding: 15px;">
                  <h2> Impending Deadline Alert!</h2>
                  <p>Hi ${staffUser.username || "there"},</p>
                  <p>This is an urgent reminder for the following complaint:</p>
                  <h3>${complaint.title}</h3>
                  <p><strong>Description:</strong> ${complaint.description}</p>
                  <p><strong>Current Status:</strong> ${complaint.status}</p>
                  <p><strong>Deadline:</strong> ${new Date(complaint.deadline).toLocaleString()}</p>
                  <p><strong>Time Remaining:</strong> Approximately ${minutesRemaining} minutes</p>
                  <br/>
                  <p>Please take immediate action to resolve this complaint.<br/>– DevSync Team</p>
                </div>
              `;
              await sendEmail(staffUser.email, title, body, html);
            }

            complaint.lastDeadlineAlerted = now;
            await complaint.save();
          }
        }
      }

    } catch (err) {
      console.error("Error in cron job:", err);
    }
  });

  console.log("Cron job scheduled: checking complaint Assigned and complaint deadlines.");
};

export { sendnoti, sendNotification, sendEmail };