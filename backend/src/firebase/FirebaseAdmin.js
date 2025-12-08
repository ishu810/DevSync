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

export default admin;

