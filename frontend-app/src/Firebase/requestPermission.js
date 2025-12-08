import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";
import axios from "axios";

export const requestPermission = async (userId) => {
  console.log("Requesting notification permission...");

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return;
    }

    const userResponse = await axios.get(`http://localhost:5000/api/users/${userId}`); 
    const existingFcmToken = userResponse.data?.user?.fcmToken;

    if (existingFcmToken) {
      console.log("User already has an FCM token:", existingFcmToken);
      return;
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );
    console.log(permission)
    console.log(registration)
    
    const fcmToken = await getToken(messaging, {
      vapidKey:"BJ-_r57gZZxXsA8-jgDuzZ4uW8dfTWJDlJt5j9v_0m2WkB5SNDpm-X8v5pKeFeGs0XgBQkVfczZNOOKd4eDb7Q0",
      serviceWorkerRegistration: registration,
    });
    console.log(fcmToken)
    console.log("got fcm token")
    console.log("vapikey",import.meta.env.VITE_VAPID_KEY)

    if (!fcmToken) {
      console.error("Failed to get FCM token from Firebase");
      return;
    }

    console.log("FCM Token:", fcmToken);

    const response = await axios.post("http://localhost:5000/api/v1/save-token", {
      fcmToken,
      userId,
    });
    console.log("res data",response.data);
    
    console.log("response",response)
    if (response.status===200) {
      console.log("Token saved successfully:", response.data);
    } else {
      console.warn("Failed to save token:", response.data?.message);
    }
  } catch (err) {
    console.error("Error in requestPermission:", err);
  }
};
